<?php

namespace App\Http\Controllers;

use App\Http\Resources\Invoice\InvoiceResource;
use App\Http\Resources\DeliveryOrder\PendingDeliveryOrderResource;
use App\Models\DeliveryOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Invoice;
use App\Models\User;
use App\Models\TenantSetting;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    private function getFilteredInvoices(Request $request, string $tenantId)
    {
        $query = Invoice::query()
            ->where('tenant_id', $tenantId)
            ->with([
                'salesPerson:id,name',
                'salesOrder:id,so_number',
                'deliveryOrder:id,do_number',
            ])
            ->select([
                'id', 'invoice_number', 'client_name', 'sales_user_id',
                'sales_order_id', 'delivery_order_id', 'issue_date',
                'due_date', 'grand_total', 'status', 'created_at'
            ])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('invoice_number', 'like', "%{$search}%")
                      ->orWhere('client_name', 'like', "%{$search}%")
                      ->orWhereHas('salesPerson', function ($salesQuery) use ($search) {
                          $salesQuery->where('name', 'like', "%{$search}%");
                      })
                      ->orWhereHas('salesOrder', function ($soQuery) use ($search) {
                          $soQuery->where('so_number', 'like', "%{$search}%");
                      })
                      ->orWhereHas('deliveryOrder', function ($doQuery) use ($search) {
                          $doQuery->where('do_number', 'like', "%{$search}%");
                      });
                });
            })
            ->when($request->filled('status') && $request->status !== 'all', function ($query) use ($request) {
                if ($request->status === 'unpaid') {
                    $query->whereNotIn('status', ['paid', 'partial', 'cancelled']);
                } else {
                    $query->where('status', $request->status);
                }
            });

        $sort = $request->input('sort', 'newest');

        match ($sort) {
            'oldest'        => $query->orderBy('created_at', 'asc'),
            'issue_newest'  => $query->orderBy('issue_date', 'desc'),
            'issue_oldest'  => $query->orderBy('issue_date', 'asc'),
            'due_nearest'   => $query->orderBy('due_date', 'asc'),
            'highest_value' => $query->orderBy('grand_total', 'desc'),
            'lowest_value'  => $query->orderBy('grand_total', 'asc'),
            default         => $query->orderBy('created_at', 'desc'),
        };

        return $query->paginate(10)->withQueryString();
    }

    private function getPendingDeliveryOrders(string $tenantId)
    {
        return DeliveryOrder::query()
            ->where('tenant_id', $tenantId)
            ->where('status', 'delivered')
            ->whereNotIn('id', function ($q) use ($tenantId) {
                $q->select('delivery_order_id')
                  ->from('invoices')
                  ->where('tenant_id', $tenantId)
                  ->whereNotNull('delivery_order_id');
            })
            ->with(['salesOrder:id,so_number'])
            ->get(['id', 'sales_order_id', 'do_number', 'client_name', 'delivered_at', 'status']);
    }

    public function index(Request $request)
    {
        $tenantId = session('active_tenant_id');

        return Inertia::render('invoices/index', [
            'invoices' => InvoiceResource::collection(
                $this->getFilteredInvoices($request, $tenantId)
            ),
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? 'all',
                'sort'   => $request->sort ?? 'newest',
            ],
            'pendingDeliveryOrders' => PendingDeliveryOrderResource::collection(
                $this->getPendingDeliveryOrders($tenantId)
            ),
        ]);
    }

    public function create(Request $request)
    {
        $tenantId = session('active_tenant_id');
        $count = Invoice::where('tenant_id', $tenantId)->count() + 1;
        $invoiceNumber = 'INV-' . date('ym') . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);

        $salesDivision = \App\Models\Division::where('tenant_id', $tenantId)
            ->where('name', 'like', '%Sales%Marketing%') 
            ->first();

        if ($salesDivision) {
            $salesReps = User::whereHas('tenants', function($q) use ($tenantId, $salesDivision) {
                // Syarat Harus di perusahaan ini
                $q->where('tenant_user.tenant_id', $tenantId)
                  // Syarat Harus aktif
                  ->where('tenant_user.is_active', true)
                  // Syarat Division ID di pivot table harus sama dengan divisi Sales
                  ->where('tenant_user.division_id', $salesDivision->id);
            })->get(['id', 'name']);
        } else {
            $salesReps = collect(); 
        }

        // CEK APAKAH INVOICE INI DIBUAT DARI SALES ORDER?
        $sourceData = null;
        if ($request->has('source_so_id')) {
            $so = \App\Models\SalesOrder::with('items')->find($request->source_so_id);
            if ($so) {
                $sourceData = [
                    'client_name' => $so->client_name,
                    'sales_user_id' => $so->sales_user_id,
                    'sales_order_id' => $so->id,
                    'items' => $so->items->map(function($item) {
                        return [
                            'item_name' => $item->item_name,
                            'quantity' => $item->quantity,
                            'unit_price' => $item->unit_price,
                        ];
                    })
                ];
            }
        }
        if ($request->has('source_do_id')) {
            $do = \App\Models\DeliveryOrder::with(['items', 'salesOrder.items'])->find($request->source_do_id);
            if ($do) {
                $soPrices = [];
                if ($do->salesOrder && $do->salesOrder->items) {
                    foreach ($do->salesOrder->items as $soItem) {
                        $soPrices[$soItem->item_name] = $soItem->unit_price;
                    }
                }

                $sourceData = [
                    'client_name' => $do->client_name,
                    'sales_user_id' => $do->salesOrder ? $do->salesOrder->sales_user_id : '',
                    'sales_order_id' => $do->sales_order_id, 
                    'delivery_order_id' => $do->id,    
                    'items' => $do->items->map(function($item) use ($soPrices) {
                        return [
                            'item_name' => $item->item_name,
                            'quantity' => $item->quantity,
                            'unit_price' => $soPrices[$item->item_name] ?? 0, 
                        ];
                    })
                ];
            }
        }

        return Inertia::render('invoices/create', [
            'invoiceNumber' => $invoiceNumber,
            'salesReps' => $salesReps,
            'sourceData' => $sourceData
        ]);
    }

    public function show($id)
    {
        $tenantId = session('active_tenant_id');
        
        $invoice = Invoice::with([
            'items', 
            'salesPerson:id,name',
            'paymentReceipts' => function($q) {
                $q->orderBy('created_at', 'desc');
            }
        ])->where('tenant_id', $tenantId)->findOrFail($id);

        return Inertia::render('invoices/show', [
            'invoice' => $invoice
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'client_name' => 'required|string',
            'sales_user_id' => 'required|exists:users,id',
            'issue_date' => 'required|date',
            'due_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request) {
            $subtotal = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $totalPrice = $item['quantity'] * $item['unit_price'];
                $subtotal += $totalPrice;
                $itemsData[] = [
                    'item_name' => $item['item_name'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $totalPrice,
                ];
            }

            $tax = $request->apply_tax ? ($subtotal * 0.11) : 0; // PPN 11%
            $grandTotal = $subtotal + $tax;

            $invoice = Invoice::create([
                'tenant_id' => session('active_tenant_id'),
                'invoice_number' => $request->invoice_number,
                'sales_order_id' => $request->sales_order_id ?? null,
                'delivery_order_id' => $request->delivery_order_id ?? null,
                'client_name' => $request->client_name,
                'sales_user_id' => $request->sales_user_id,
                'issue_date' => $request->issue_date,
                'due_date' => $request->due_date,
                'subtotal' => $subtotal,
                'tax_amount' => $tax,
                'grand_total' => $grandTotal,
                'balance_due' => $grandTotal,
                'status' => 'unpaid',
                'notes' => $request->notes,
                'created_by' => auth()->id()
            ]);

            $invoice->items()->createMany($itemsData);
        });

        return redirect()->route('invoices.index')->with('success', 'Faktur berhasil dibuat!');
    }

    public function print($id)
    {
        $tenantId = session('active_tenant_id');

        // data invoice beserta item dan sales-nya
        $invoice = Invoice::where('tenant_id', $tenantId)
            ->with(['items', 'salesPerson:id,name'])
            ->findOrFail($id);

        // pengaturan kustomisasi template
        $settings = TenantSetting::where('tenant_id', $tenantId)->first();

        return Inertia::render('invoices/partials/print', [
            'invoice' => $invoice,
            'settings' => $settings
        ]);
    }

    public function printBulk(Request $request)
    {
        $tenantId = session('active_tenant_id');

        // Mendukung format ?ids=1,2,3 maupun ?ids[]=1&ids[]=2
        $rawIds = $request->input('ids', []);
        $ids = is_array($rawIds)
            ? $rawIds
            : array_filter(explode(',', (string) $rawIds));

        if (empty($ids)) {
            return redirect()->route('invoices.index')
                ->with('error', 'Pilih minimal satu Faktur untuk dicetak.');
        }

        // Tarik data lengkap langsung seperti print($id) tanpa Resource
        $invoices = Invoice::where('tenant_id', $tenantId)
            ->with([
                'items',
                'salesPerson:id,name',
                'salesOrder:id,so_number',
                'deliveryOrder:id,do_number',
            ])
            ->whereIn('id', $ids)
            ->orderBy('id', 'asc')
            ->get();

        if ($invoices->isEmpty()) {
            return redirect()->route('invoices.index')
                ->with('error', 'Data Faktur tidak ditemukan.');
        }

        // Pengaturan kustomisasi template
        $settings = TenantSetting::where('tenant_id', $tenantId)->first();

        return Inertia::render('invoices/partials/print-bulk', [
            'invoices' => $invoices,
            'settings' => $settings,
        ]);
    }

    // Pencatatan Pembayaran
    public function recordPayment(Request $request, $id)
    {
        $request->validate([
            'amount_paid' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
            'payment_method' => 'nullable|string', 
            'reference_number' => 'nullable|string'
        ]);

        $tenantId = session('active_tenant_id');
        $invoice = Invoice::where('tenant_id', $tenantId)->findOrFail($id);

        if ($invoice->balance_due > 0) {
            DB::transaction(function () use ($request, $invoice, $tenantId) {
                // Keamanan: Mencegah over-payment (bayar melebihi sisa hutang)
                $amountToPay = min($request->amount_paid, $invoice->balance_due);

                // Buat Nomor Resi Pembayaran
                $count = \App\Models\PaymentReceipt::where('tenant_id', $tenantId)->count() + 1;
                $receiptNumber = 'REC-' . date('ym') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

                // Simpan riwayat cicilan ke tabel payment_receipts
                $invoice->paymentReceipts()->create([
                    'tenant_id' => $tenantId,
                    'receipt_number' => $receiptNumber,
                    'amount_paid' => $amountToPay,
                    'payment_date' => $request->payment_date,
                    'payment_method' => $request->payment_method,
                    'reference_number' => $request->reference_number,
                ]);

                // Hitung Sisa Hutang yang Baru
                $newBalance = $invoice->balance_due - $amountToPay;
                
                // Jika hutang 0, status jadi 'paid'. Jika masih ada sisa, 'partial'
                $newStatus = $newBalance <= 0 ? 'paid' : 'partial';

                $invoice->update([
                    'balance_due' => $newBalance,
                    'status' => $newStatus
                ]);

                // Masukkan ke Target Sales HANYA JIKA SUDAH LUNAS
                if ($newStatus === 'paid' && $invoice->sales_user_id) {
                    $monthYear = \Carbon\Carbon::parse($invoice->issue_date)->format('Y-m'); 
                    
                    $target = \App\Models\SalesTarget::firstOrCreate(
                        ['tenant_id' => $tenantId, 'user_id' => $invoice->sales_user_id, 'month_year' => $monthYear],
                        ['target_amount' => 0, 'achieved_amount' => 0]
                    );

                    $target->increment('achieved_amount', $invoice->grand_total);
                }
            });

            return redirect()->back()->with('success', 'Pembayaran berhasil dicatat. Sisa tagihan otomatis diperbarui!');
        }

        return redirect()->back()->with('error', 'Faktur ini sudah lunas sepenuhnya.');
    }
}
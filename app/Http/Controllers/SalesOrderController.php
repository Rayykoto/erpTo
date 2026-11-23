<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SalesOrder;
use App\Models\Product;
use App\Models\User;
use App\Models\Division;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\Product\ProductResource;
use App\Http\Resources\SalesOrder\SalesOrderResource;
use App\Http\Resources\SalesOrder\SalesOrderDetailResource;

class SalesOrderController extends Controller
{
    private function getFilteredSalesOrders(Request $request, string $tenantId)
    {
        $query = SalesOrder::query()
            ->where('tenant_id', $tenantId)
            // Mencegah N+1
            ->with(['salesPerson:id,name']) 
            ->withSum(['invoices as total_invoiced_amount' => function ($q) {
                $q->where('status', '!=', 'cancelled');
            }], 'grand_total')
            ->select([
                'id', 'so_number', 'client_name', 'order_date', 
                'grand_total', 'status', 'approval_status', 'sales_user_id', 'created_at'
            ])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('so_number', 'like', "%{$search}%")
                      ->orWhere('client_name', 'like', "%{$search}%")
                      ->orWhereHas('salesPerson', function ($salesQuery) use ($search) {
                          $salesQuery->where('name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($request->filled('status') && $request->status !== 'all', function ($query) use ($request) {
                $query->where('status', $request->status);
            });

        $sort = $request->input('sort', 'newest');

        match ($sort) {
            'oldest'        => $query->orderBy('created_at', 'asc'),
            'highest_value' => $query->orderBy('grand_total', 'desc'),
            'lowest_value'  => $query->orderBy('grand_total', 'asc'),
            'order_newest'  => $query->orderBy('order_date', 'desc'),
            'order_oldest'  => $query->orderBy('order_date', 'asc'),
            default         => $query->orderBy('created_at', 'desc'),
        };

        return $query->paginate(10)->withQueryString();
    }

    private function generateSoNumber(string $tenantId, bool $withLock = false): string
    {
        $prefix = 'SO-' . date('ym') . '-';

        $query = SalesOrder::where('tenant_id', $tenantId)
            ->where('so_number', 'like', $prefix . '%')
            ->orderBy('id', 'desc');

        if ($withLock) {
            $query->lockForUpdate();
        }

        // Ambil hanya kolom so_number untuk efisiensi
        $lastSo = $query->first(['so_number']);

        $nextNumber = $lastSo ? ((int) substr($lastSo->so_number, -4) + 1) : 1;
        return $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    public function index(Request $request)
    {
        $tenantId = session('active_tenant_id');

        return Inertia::render('sales-orders/index', [
            'salesOrders' => SalesOrderResource::collection(
                $this->getFilteredSalesOrders($request, $tenantId)
            ),
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? 'all',
                'sort'   => $request->sort ?? 'newest',
            ],
        ]);
    }

    public function create()
    {
        $tenantId = session('active_tenant_id');

        $salesDivision = Division::where('tenant_id', $tenantId)
            ->where('name', 'like', '%Sales%Marketing%') 
            ->first();

        // Ambil Karyawan (HANYA Divisi Sales & Marketing)
        $salesReps = collect();
        if ($salesDivision) {
            $salesReps = User::whereHas('tenants', function($q) use ($tenantId, $salesDivision) {
                $q->where('tenant_user.tenant_id', $tenantId)
                  ->where('tenant_user.is_active', true)
                  ->where('tenant_user.division_id', $salesDivision->id);
            })->get(['id', 'name']);
        }

        // Ambil data produk
        $products = Product::where('tenant_id', $tenantId)
            ->select(['id', 'sku', 'name', 'price', 'stock'])
            ->get();

        return Inertia::render('sales-orders/create', [
            'soNumber'  => $this->generateSoNumber($tenantId, false),
            'salesReps' => $salesReps, // Bisa dilempar biasa karena tidak rahasia
            'products'  => ProductResource::collection($products) // Bungkus dengan Resource
        ]);
    }

    public function store(Request $request)
    {
        $activeTenantId = session('active_tenant_id');

        $request->validate([
            'client_name' => 'required|string',
            'order_date'  => 'required|date',
            'items'       => 'required|array|min:1',
            'items.*.item_name'  => 'required|string',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.product_id' => 'nullable|exists:products,id',
        ]);

        try {
            DB::transaction(function () use ($request, $activeTenantId) {

                $finalSoNumber = $this->generateSoNumber($activeTenantId, true);

                $subtotal = 0;
                $itemsData = [];

                foreach ($request->items as $item) {
                    $totalPrice = $item['quantity'] * $item['unit_price'];
                    $subtotal += $totalPrice;
                    
                    $itemsData[] = [
                        'product_id'  => $item['product_id'] ?? null,
                        'item_name'   => $item['item_name'],
                        'quantity'    => $item['quantity'],
                        'unit_price'  => $item['unit_price'],
                        'total_price' => $totalPrice,
                    ];
                }

                $tax = $request->apply_tax ? ($subtotal * 0.11) : 0;
                $grandTotal = $subtotal + $tax;

                $so = SalesOrder::create([
                    'tenant_id'       => $activeTenantId,
                    'so_number'       => $finalSoNumber,
                    'client_name'     => $request->client_name,
                    'sales_user_id'   => $request->sales_user_id,
                    'order_date'      => $request->order_date,
                    'subtotal'        => $subtotal,
                    'tax_amount'      => $tax,
                    'grand_total'     => $grandTotal,
                    'status'          => 'pending',
                    'approval_status' => 'waiting_approval',
                    'created_by'      => auth()->id(),
                ]);

                $so->items()->createMany($itemsData);
            });

        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1062) {
                return redirect()->back()->withErrors([
                    'error' => 'Nomor dokumen ini baru saja digunakan oleh transaksi lain. Silakan refresh untuk memperbarui nomor.'
                ]);
            }
            return redirect()->back()->withErrors([
                'error' => 'Terjadi kendala saat menyimpan data ke server. Silakan coba beberapa saat lagi.'
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Gagal memproses pesanan: ' . $e->getMessage()
            ]);
        }

        return redirect()->route('sales-orders.index')->with('success', 'Sales Order berhasil dibuat!');
    }

    public function show($id)
    {
        $tenantId = session('active_tenant_id');
        
        $salesOrder = SalesOrder::with([
            'salesPerson:id,name',
            'items',
            'invoices',
            'activities.causer' => function($q) { 
                $q->orderBy('created_at', 'desc'); 
            },
            'deliveryOrders' => function($q) { 
                $q->orderBy('created_at', 'desc'); 
            }
        ])->where('tenant_id', $tenantId)->findOrFail($id);

        return Inertia::render('sales-orders/show', [
            'salesOrder' => new SalesOrderDetailResource($salesOrder)
        ]);
    }

    // ==========================================================
    // INTEGRASI & APPROVAL
    // ==========================================================
    public function createInvoiceFromSO($id)
    {
        $so = SalesOrder::where('tenant_id', session('active_tenant_id'))->findOrFail($id);
        return redirect()->route('invoices.create', ['source_so_id' => $so->id]);
    }

    public function createDOFromSO($id)
    {
        $so = SalesOrder::where('tenant_id', session('active_tenant_id'))->findOrFail($id);
        return redirect()->route('delivery-orders.create', ['source_so_id' => $so->id]);
    }

    public function approve($id)
    {
        $so = SalesOrder::where('tenant_id', session('active_tenant_id'))->findOrFail($id);
        
        if ($so->approval_status !== 'waiting_approval') {
            return redirect()->back()->with('error', 'Dokumen ini tidak dalam status menunggu persetujuan.');
        }
        
        $so->update([
            'status'          => 'confirmed',
            'approval_status' => 'approved',
            'approved_by_id'  => auth()->id() 
        ]);

        if (function_exists('activity')) {
             activity()
             ->performedOn($so) 
             ->causedBy(auth()->user()) 
             ->log('Dokumen Sales Order disetujui secara manual oleh Manajer.');
        }

        return redirect()->back()->with('success', 'Sales Order bernilai besar ini berhasil disetujui dan sah untuk diproses!');
    }
}
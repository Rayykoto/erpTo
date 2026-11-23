<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\Product;
use App\Models\StockLedger;
use App\Http\Resources\GoodsReceipt\GoodsReceiptResource;
use App\Http\Resources\GoodsReceipt\GoodsReceiptDetailResource;
use App\Http\Resources\GoodsReceipt\PendingPoResource;
use App\Http\Resources\Product\ProductResource;
use Illuminate\Support\Facades\DB;

class GoodsReceiptController extends Controller
{
    private function getFilteredGoodsReceipts(Request $request, string $tenantId)
    {
        $query = GoodsReceipt::query()
            ->where('tenant_id', $tenantId)
            // CEGAH N+1
            ->with([
                'purchaseOrder:id,po_number', 
                'createdBy:id,name',
                'responsiblePerson:id,name'
            ])
            ->select([
                'id', 'gr_number', 'supplier_name', 'receipt_date', 
                'status', 'purchase_order_id', 'created_by', 'responsible_person', 'created_at'
            ])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($sub) use ($search) {
                    $sub->where('gr_number', 'like', "%{$search}%")
                        ->orWhere('supplier_name', 'like', "%{$search}%")
                        ->orWhereHas('purchaseOrder', function ($poQuery) use ($search) {
                            $poQuery->where('po_number', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->filled('status') && $request->status !== 'all', function ($q) use ($request) {
                match ($request->status) {
                    'received'     => $q->whereNotNull('purchase_order_id'),
                    'not_received' => $q->whereNull('purchase_order_id'),
                    default        => null,
                };
            });

        $sort = $request->input('sort', 'newest');

        match ($sort) {
            'oldest'         => $query->orderBy('created_at', 'asc'),
            'receipt_newest' => $query->orderBy('receipt_date', 'desc'),
            'receipt_oldest' => $query->orderBy('receipt_date', 'asc'),
            default          => $query->orderBy('created_at', 'desc'),
        };

        return $query->paginate(10)->withQueryString();
    }

    private function generateGrNumber(string $tenantId, bool $withLock = false): string
    {
        $prefix = 'GR-' . date('ym') . '-';

        $query = GoodsReceipt::where('tenant_id', $tenantId)
            ->where('gr_number', 'like', $prefix . '%')
            ->orderBy('id', 'desc');

        if ($withLock) {
            $query->lockForUpdate();
        }

        $lastGr = $query->first(['gr_number']);
        $nextNumber = $lastGr ? ((int) substr($lastGr->gr_number, -3) + 1) : 1;

        return $prefix . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }

    public function index(Request $request)
    {
        $tenantId = session('active_tenant_id');

        // Antrean PO siap terima
        $pendingPOs = PurchaseOrder::where('tenant_id', $tenantId)
            ->where('status', 'confirmed')
            ->orderBy('order_date', 'asc')
            ->get(['id', 'po_number', 'supplier_name', 'order_date', 'status']);

        return Inertia::render('good-receipts/index', [
            'goodsReceipts' => GoodsReceiptResource::collection(
                $this->getFilteredGoodsReceipts($request, $tenantId)
            ),
            'pendingPOs' => PendingPoResource::collection($pendingPOs),
            'filters'    => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? 'all',
                'sort'   => $request->sort ?? 'newest',
            ],
        ]);
    }

    public function create(Request $request)
    {
        $tenantId = session('active_tenant_id');
        $grNumber = $this->generateGrNumber($tenantId, false);

        $sourceData = null;
        if ($request->filled('source_po_id')) {
            // OPTIMASI
            $po = PurchaseOrder::where('tenant_id', $tenantId)
                ->with(['items:id,purchase_order_id,item_name,quantity'])
                ->find($request->source_po_id);

            if ($po) {
                $sourceData = [
                    'purchase_order_id' => $po->id,
                    'supplier_name'     => $po->supplier_name,
                    'items'             => $po->items->map(fn($item) => [
                        'product_id' => '', // Dikosongkan untuk di-mapping oleh tim gudang
                        'item_name'  => $item->item_name,
                        'quantity'   => (int) $item->quantity, 
                    ])
                ];
            }
        }

        $products = Product::where('tenant_id', $tenantId)
            ->get(['id', 'sku', 'name', 'price', 'stock']);

        return Inertia::render('good-receipts/create', [
            'grNumber'   => $grNumber,
            'sourceData' => $sourceData,
            'products'   => ProductResource::collection($products)
        ]);
    }

    public function store(Request $request)
    {
        $activeTenantId = session('active_tenant_id');

        $request->validate([
            'supplier_name'     => 'required|string',
            'receipt_date'      => 'required|date',
            'items'             => 'required|array|min:1',
            'items.*.item_name' => 'required|string',
            'items.*.quantity'  => 'required|integer|min:1',
            'purchase_order_id' => 'nullable|exists:purchase_orders,id'
        ]);

        try {
            DB::transaction(function () use ($request, $activeTenantId) {

                $finalGrNumber = $this->generateGrNumber($activeTenantId, true);

                $gr = GoodsReceipt::create([
                    'tenant_id'         => $activeTenantId,
                    'created_by'        => auth()->id(),
                    'gr_number'         => $finalGrNumber,
                    'purchase_order_id' => $request->purchase_order_id,
                    'supplier_name'     => $request->supplier_name,
                    'receipt_date'      => $request->receipt_date,
                    'receiver_name'     => $request->receiver_name,
                    'status'            => 'pending',
                    'notes'             => $request->notes,
                ]);

                $itemsData = array_map(fn($item) => [
                    'product_id' => $item['product_id'] ?? null,
                    'item_name'  => $item['item_name'],
                    'quantity'   => $item['quantity'],
                ], $request->items);

                $gr->items()->createMany($itemsData);

                if ($request->purchase_order_id) {
                    PurchaseOrder::where('tenant_id', $activeTenantId)
                        ->where('id', $request->purchase_order_id)
                        ->update(['status' => 'completed']);
                }
            });

            return redirect()->route('goods-receipts.index')
                ->with('success', 'Bukti Terima Barang (GR) berhasil dibuat, menunggu konfirmasi gudang.');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal membuat Bukti Terima Barang: ' . $e->getMessage());
        }
    }

    public function show($id)
    {
        $tenantId = session('active_tenant_id');
        
        $goodsReceipt = GoodsReceipt::with([
            'items', 
            'purchaseOrder:id,po_number', 
            'createdBy:id,name'
        ])
        ->where('tenant_id', $tenantId)
        ->findOrFail($id);

        return Inertia::render('good-receipts/show', [
            'goodsReceipt' => new GoodsReceiptDetailResource($goodsReceipt)
        ]);
    }

    public function markAsReceived(Request $request, $id)
    {
        $activeTenantId = session('active_tenant_id');

        $goodsReceipt = GoodsReceipt::where('tenant_id', $activeTenantId)
            ->with('items')
            ->findOrFail($id);

        if ($goodsReceipt->status === 'received') {
            return redirect()->back()->with('error', 'Dokumen Bukti Terima ini sudah diproses sebelumnya.');
        }

        try {
            DB::transaction(function () use ($goodsReceipt, $activeTenantId) {
                $goodsReceipt->update([
                    'status' => 'received',
                    'responsible_person' => auth()->id()
                ]);

                foreach ($goodsReceipt->items as $item) {
                    if (empty($item->product_id)) {
                        continue;
                    }

                    // mencegah race-condition persediaan
                    $product = Product::where('tenant_id', $activeTenantId)
                        ->where('id', $item->product_id)
                        ->lockForUpdate()
                        ->first();

                    if (!$product) {
                        throw new \Exception("Produk Master ID [{$item->product_id}] tidak ditemukan.");
                    }

                    $newBalance = $product->stock + $item->quantity;
                    $product->update(['stock' => $newBalance]);

                    // Catat ke Mutasi Stok
                    StockLedger::create([
                        'tenant_id'       => $activeTenantId,
                        'product_id'      => $product->id,
                        'reference_type'  => GoodsReceipt::class,
                        'reference_id'    => $goodsReceipt->id,
                        'type'            => 'in',
                        'quantity'        => $item->quantity,
                        'running_balance' => $newBalance,
                        'notes'           => "Penerimaan Barang PO (GR #{$goodsReceipt->gr_number})"
                    ]);
                }

                if (function_exists('activity')) {
                    activity()
                        ->performedOn($goodsReceipt)
                        ->causedBy(auth()->user())
                        ->log("Bukti Terima (GR) diselesaikan. Stok gudang berhasil DITAMBAH.");
                }
            }); 

            return redirect()->back()->with('success', 'Penerimaan selesai, Stok Gudang telah BERTAMBAH secara otomatis!');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memproses penerimaan barang: ' . $e->getMessage());
        }
    }
}
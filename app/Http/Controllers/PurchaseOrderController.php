<?php

namespace App\Http\Controllers;

use App\Http\Resources\Product\ProductResource;
use App\Http\Resources\PurchaseOrder\PurchaseOrderDetailResource;
use App\Http\Resources\PurchaseOrder\PurchaseOrderResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PurchaseOrder;
use App\Models\Product;
use Illuminate\Support\Facades\DB;


class PurchaseOrderController extends Controller
{
    private function getFilteredPurchaseOrders(Request $request, string $tenantId)
    {
        $query = PurchaseOrder::query()
            ->where('tenant_id', $tenantId)
            // CEGAH N+1
            ->with(['creator:id,name', 'responsiblePerson:id,name'])
            ->select([
                'id', 'po_number', 'supplier_name', 'order_date', 
                'grand_total', 'status', 'approval_status', 'created_by', 'responsible_person'
            ])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('po_number', 'like', "%{$search}%")
                    ->orWhere('supplier_name', 'like', "%{$search}%");
                });
            });

        $sort = $request->input('sort', 'newest');
        
        match ($sort) {
            'oldest' => $query->orderBy('created_at', 'asc'),
            'highest_value' => $query->orderBy('grand_total', 'desc'),
            'lowest_value' => $query->orderBy('grand_total', 'asc'),
            default => $query->orderBy('created_at', 'desc'), // 'newest'
        };

        return $query->paginate(10)->withQueryString();
    }

    public function index(Request $request)
{
    $tenantId = session('active_tenant_id');

    return Inertia::render('purchase-orders/index', [
        'purchaseOrders' => PurchaseOrderResource::collection(
            $this->getFilteredPurchaseOrders($request, $tenantId)
        ),
        'filters' => [
            'search' => $request->search ?? '',
            'sort'   => $request->sort ?? 'newest',
        ]
    ]);
}

    private function generatePoNumber(string $tenantId, bool $withLock = false): string
    {
        $prefix = 'PO-' . date('ym') . '-';

        $query = PurchaseOrder::where('tenant_id', $tenantId)
            ->where('po_number', 'like', $prefix . '%')
            ->orderBy('id', 'desc');

        if ($withLock) {
            $query->lockForUpdate();
        }

        $lastPo = $query->first(['po_number']);
        $nextNumber = $lastPo ? ((int) substr($lastPo->po_number, -4) + 1) : 1;
        
        return $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    public function create()
    {
        $tenantId = session('active_tenant_id');

        $products = Product::where('tenant_id', $tenantId)
            ->select(['id', 'sku', 'name', 'price', 'stock'])
            ->get();

        return Inertia::render('purchase-orders/create', [
            'poNumber' => $this->generatePoNumber($tenantId, false),
            'products' => ProductResource::collection($products) 
        ]);
    }

    public function store(Request $request)
    {
        $activeTenantId = session('active_tenant_id');

        $request->validate([
            'supplier_name' => 'required|string',
            'order_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        try {
            DB::transaction(function () use ($request, $activeTenantId) {

                $finalPoNumber = $this->generatePoNumber($activeTenantId, true); 

                $subtotal = 0;
                $itemsData = [];

                foreach ($request->items as $item) {
                    $totalPrice = $item['quantity'] * $item['unit_price'];
                    $subtotal += $totalPrice;

                    $itemsData[] = [
                        'product_id' => null,
                        'item_name' => $item['item_name'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'total_price' => $totalPrice,
                    ];
                }

                $tax = $request->apply_tax ? ($subtotal * 0.11) : 0;
                $grandTotal = $subtotal + $tax;

                // Simpan PO
                $po = PurchaseOrder::create([
                    'tenant_id' => $activeTenantId,
                    'po_number' => $finalPoNumber, 
                    'supplier_name' => $request->supplier_name,
                    'order_date' => $request->order_date,
                    'subtotal' => $subtotal,
                    'tax_amount' => $tax,
                    'grand_total' => $grandTotal,
                    'status' => 'draft', 
                    'approval_status' => 'waiting',
                    'created_by' => auth()->id()
                ]);

                $po->items()->createMany($itemsData);
            });

        } catch (\Illuminate\Contracts\Cache\LockTimeoutException $e) {
            return redirect()->back()->withErrors(['error' => 'Sistem sedang sibuk memproses pesanan lain. Silakan coba lagi.']);
        }

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order (PO) berhasil diterbitkan ke Pemasok!');
    }

    public function show($id)
    {
        $tenantId = session('active_tenant_id');

        $po = PurchaseOrder::where('tenant_id', $tenantId)
            ->with([
                'items', 
                'creator:id,name', 
                'responsiblePerson:id,name'
            ])
            ->findOrFail($id);

        return Inertia::render('purchase-orders/show', [
            'purchaseOrder' => new PurchaseOrderDetailResource($po)
        ]);
    }

    public function createGRFromPO($id)
    {
        $po = PurchaseOrder::where('tenant_id', session('active_tenant_id'))->findOrFail($id);
        
        // Melempar ID PO ke halaman form GR untuk diproses
        return redirect()->route('goods-receipts.create', ['source_po_id' => $po->id]);
    }

    public function approve(Request $request, $id)
    {
        $tenantId = session('active_tenant_id');
        
        $po = PurchaseOrder::where('tenant_id', $tenantId)->findOrFail($id);

        if ($po->approval_status !== 'waiting') {
            return redirect()->back()->with('error', 'Dokumen ini sudah diproses (tidak dalam status menunggu persetujuan).');
        }

        // Di sini kita catat siapa yang menyetujuinya
        $po->update([
            'approval_status' => 'approved',
            'status' => 'confirmed', 
            'responsible_person' => auth()->id(), 
        ]);

        return redirect()->back()->with('success', 'Purchase Order berhasil disetujui dan siap diteruskan ke Gudang/Pemasok!');
    }

    public function reject(Request $request, $id)
    {
        $tenantId = session('active_tenant_id');
        $po = PurchaseOrder::where('tenant_id', $tenantId)->findOrFail($id);

        $po->update([
            'approval_status' => 'rejected',
            'status' => 'cancelled',
            'responsible_person' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Purchase Order telah ditolak.');
    }
}
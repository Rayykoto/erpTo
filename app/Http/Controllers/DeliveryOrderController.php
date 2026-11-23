<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\DeliveryOrder;
use App\Models\Product;
use App\Models\SalesOrder;
use App\Models\StockLedger;
use App\Models\TenantSetting;
use Illuminate\Support\Facades\DB;

class DeliveryOrderController extends Controller
{

    public function index(Request $request)
    {
        $tenantId = session('active_tenant_id');
        
        $query = DeliveryOrder::query()
            ->where('tenant_id', $tenantId)
            ->with(['salesOrder:id,so_number'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($sub) use ($search) {
                    $sub->where('do_number', 'like', "%{$search}%")
                        ->orWhere('client_name', 'like', "%{$search}%")
                        ->orWhere('vehicle_number', 'like', "%{$search}%")
                        ->orWhere('driver_name', 'like', "%{$search}%")
                        ->orWhereHas('salesOrder', function ($soQuery) use ($search) {
                            $soQuery->where('so_number', 'like', "%{$search}%");
                        });
                });
            });

        $sort = $request->input('sort', 'newest');

        match ($sort) {
            'oldest'          => $query->orderBy('created_at', 'asc'),
            'delivery_newest' => $query->orderBy('delivery_date', 'desc'),
            'delivery_oldest' => $query->orderBy('delivery_date', 'asc'),
            default           => $query->orderBy('created_at', 'desc'),
        };

        $deliveryOrders = $query->paginate(10)->withQueryString();

        $pendingSalesOrders = SalesOrder::query()
            ->where('tenant_id', $tenantId)
            ->where('status', 'confirmed')
            ->where('approval_status', 'approved')
            ->whereDoesntHave('deliveryOrders')
            ->select('id', 'so_number', 'client_name', 'order_date')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('delivery-orders/index', [
            'deliveryOrders'     => $deliveryOrders,
            'pendingSalesOrders' => $pendingSalesOrders,
            'filters'            => [
                'search' => $request->search ?? '',
                'sort'   => $sort,
            ],
        ]);
    }

    public function create(Request $request)
    {
        $tenantId = session('active_tenant_id');
        $count = \App\Models\DeliveryOrder::where('tenant_id', $tenantId)->count() + 1;
        $doNumber = 'DO-' . date('ym') . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);

        $sourceData = null;
        if ($request->has('source_so_id')) {
            $so = \App\Models\SalesOrder::with('items')->find($request->source_so_id);
            if ($so) {
                $sourceData = [
                    'sales_order_id' => $so->id,
                    'client_name' => $so->client_name,
                    'items' => $so->items->map(function($item) {
                        return [
                            'product_id' => $item->product_id,
                            'item_name' => $item->item_name,
                            'quantity' => $item->quantity, // DO hanya butuh kuantitas, tanpa harga
                        ];
                    })
                ];
            }
        }

        return Inertia::render('delivery-orders/create', [
            'doNumber' => $doNumber,
            'sourceData' => $sourceData
        ]);
    }

    public function show($id)
    {
        $tenantId = session('active_tenant_id');
        
        $do = DeliveryOrder::with(['items', 'salesOrder.salesPerson'])
            ->where('tenant_id', $tenantId)
            ->findOrFail($id);

        return Inertia::render('delivery-orders/show', [
            'deliveryOrder' => $do
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'client_name' => 'required|string',
            'delivery_date' => 'required|date',
            'items' => 'required|array|min:1',
            'sales_order_id' => 'nullable|exists:sales_orders,id'
        ]);

        DB::transaction(function () use ($request) {
            $do = DeliveryOrder::create([
                'tenant_id' => session('active_tenant_id'),
                'do_number' => $request->do_number,
                'sales_order_id' => $request->sales_order_id,
                'client_name' => $request->client_name,
                'delivery_date' => $request->delivery_date,
                'driver_name' => $request->driver_name,
                'vehicle_number' => $request->vehicle_number,
                'status' => 'pending',
                'notes' => $request->notes,
            ]);

            $itemsData = [];
            foreach ($request->items as $item) {
                $itemsData[] = [
                    'product_id' => $item['product_id'] ?? null,
                    'item_name' => $item['item_name'],
                    'quantity' => $item['quantity'],
                ];
            }

            $do->items()->createMany($request->items);

            if ($request->sales_order_id) {
                \App\Models\Invoice::where('sales_order_id', $request->sales_order_id)
                    ->whereNull('delivery_order_id')
                    ->update(['delivery_order_id' => $do->id]);
            }
        });

        return redirect()->route('delivery-orders.index')->with('success', 'Surat Jalan berhasil diterbitkan!');
    }

    public function print($id)
    {
        $tenantId = session('active_tenant_id');

        $do = DeliveryOrder::with(['items', 'salesOrder.salesPerson'])
            ->where('tenant_id', $tenantId)
            ->findOrFail($id);

        $settings = TenantSetting::where('tenant_id', $tenantId)->first();

        return Inertia::render('delivery-orders/partials/print', [
            'deliveryOrder' => $do,
            'settings' => $settings
        ]);     
    }

    public function printBulk(Request $request)
{
    $tenantId = session('active_tenant_id');

    $rawIds = $request->input('ids', []);
    $ids = is_array($rawIds)
        ? $rawIds
        : array_filter(explode(',', (string) $rawIds));

    if (empty($ids)) {
        return redirect()->route('delivery-orders.index')
            ->with('error', 'Pilih minimal satu Surat Jalan untuk dicetak.');
    }

    $deliveryOrders = DeliveryOrder::with(['items', 'salesOrder.salesPerson'])
        ->where('tenant_id', $tenantId)
        ->whereIn('id', $ids)
        ->orderBy('id', 'asc')
        ->get();

    if ($deliveryOrders->isEmpty()) {
        return redirect()->route('delivery-orders.index')
            ->with('error', 'Data Surat Jalan tidak ditemukan.');
    }

    $settings = TenantSetting::where('tenant_id', $tenantId)->first();

    return Inertia::render('delivery-orders/partials/print-bulk', [
        'deliveryOrders' => $deliveryOrders,
        'settings' => $settings,
    ]);
}

    public function createInvoiceFromDO($id)
    {
        $do = \App\Models\DeliveryOrder::where('tenant_id', session('active_tenant_id'))->findOrFail($id);
        return redirect()->route('invoices.create', ['source_do_id' => $do->id]);
    }

    public function markAsDelivered(Request $request, $id)
    {
        $activeTenantId = session('active_tenant_id');

        $deliveryOrder = DeliveryOrder::where('tenant_id', $activeTenantId)
            ->with('items')
            ->findOrFail($id);

        if ($deliveryOrder->status === 'delivered') {
            return redirect()->back()->with('error', 'Dokumen ini sudah diproses sebelumnya.');
        }

        try {

            DB::transaction(function () use ($deliveryOrder, $activeTenantId) {
                
                $deliveryOrder->update([
                    'status' => 'delivered',
                    'delivered_at' => now(),
                ]);

                foreach ($deliveryOrder->items as $item) {
                    if (!empty($item->product_id)) {
                        $product = Product::where('tenant_id', $activeTenantId)
                            ->where('id', $item->product_id)
                            ->lockForUpdate()
                            ->first();

                        if ($product) {
                            $newBalance = $product->stock - $item->quantity;
                            
                            $product->update(['stock' => $newBalance]);

                            StockLedger::create([
                                'tenant_id' => $activeTenantId,
                                'product_id' => $product->id,
                                'reference_type' => DeliveryOrder::class,
                                'reference_id' => $deliveryOrder->id,
                                'type' => 'out',
                                'quantity' => $item->quantity,
                                'running_balance' => $newBalance,
                                'notes' => "Fulfillment DO #{$deliveryOrder->do_number}"
                            ]);
                        } else {
                            throw new \Exception("Gagal: Produk Master untuk {$item->item_name} tidak ditemukan.");
                        }
                    } else {
                        continue; 
                    }
                }

                activity()
                    ->performedOn($deliveryOrder)
                    ->causedBy(auth()->user())
                    ->log("Surat Jalan telah diselesaikan. Stok gudang berhasil dipotong.");
            }); 

            return redirect()->back()->with('success', 'Pengiriman selesai, Kartu Stok telah diperbarui otomatis!');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memproses fulfillment: ' . $e->getMessage());
        }
    }
}
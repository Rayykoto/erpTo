<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Inertia\Inertia;
use App\Http\Resources\Product\ProductResource;

class ProductController extends Controller
{
    private function getFilteredProducts(Request $request, string $tenantId)
    {
        $query = Product::query()
            ->where('tenant_id', $tenantId)
            // CEGAH N+1
            ->with(['creator:id,name'])
            ->select([
                'id', 'sku', 'name', 'price', 'stock', 'created_by', 'created_at'
            ])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%")
                      ->orWhereHas('creator', function ($creatorQuery) use ($search) {
                          $creatorQuery->where('name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($request->filled('status') && $request->status !== 'all', function ($query) use ($request) {
                match ($request->status) {
                    'in_stock'     => $query->where('stock', '>', 20),
                    'low_stock'    => $query->whereBetween('stock', [1, 20]),
                    'out_of_stock' => $query->where('stock', '<=', 0),
                    default        => null,
                };
            });

        $sort = $request->input('sort', 'newest');

        match ($sort) {
            'oldest'        => $query->orderBy('created_at', 'asc'),
            'name_asc'      => $query->orderBy('name', 'asc'),
            'name_desc'     => $query->orderBy('name', 'desc'),
            'highest_price' => $query->orderBy('price', 'desc'),
            'lowest_price'  => $query->orderBy('price', 'asc'),
            'highest_stock' => $query->orderBy('stock', 'desc'),
            'lowest_stock'  => $query->orderBy('stock', 'asc'),
            default         => $query->orderBy('created_at', 'desc'),
        };

        return $query->paginate(10)->withQueryString();
    }

    public function index(Request $request)
    {
        $activeTenantId = session('active_tenant_id');
        if (!$activeTenantId) return redirect()->route('dashboard');

        return Inertia::render('products/index', [
            'products' => ProductResource::collection(
                $this->getFilteredProducts($request, $activeTenantId)
            ),
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? 'all',
                'sort'   => $request->sort ?? 'newest',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $activeTenantId = session('active_tenant_id');
        
        $request->validate([
            'sku'   => 'required|string|max:50|unique:products,sku,NULL,id,tenant_id,' . $activeTenantId,
            'name'  => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
        ]);

        Product::create([
            'tenant_id'  => $activeTenantId,
            'sku'        => strtoupper($request->sku),
            'name'       => $request->name,
            'price'      => $request->price,
            'stock'      => $request->stock ?? 0,
            'created_by' => auth()->id()
        ]);

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $activeTenantId = session('active_tenant_id');
        
        // Pastikan hanya memanggil data dalam tenant yang sama
        $product = Product::where('tenant_id', $activeTenantId)->findOrFail($id);

        $request->validate([
            'sku'   => 'required|string|max:50|unique:products,sku,' . $product->id . ',id,tenant_id,' . $activeTenantId,
            'name'  => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        $product->update([
            'sku'   => strtoupper($request->sku),
            'name'  => $request->name,
            'price' => $request->price,
        ]);

        return redirect()->back()->with('success', 'Data produk berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $activeTenantId = session('active_tenant_id');
        
        // Pastikan hanya mencari di lingkup tenant aktif
        $product = Product::where('tenant_id', $activeTenantId)->findOrFail($id);

        // Proteksi Enterprise: Cegah hapus barang yang pernah bermutasi
        if ($product->ledgers()->exists()) {
            return redirect()->back()->with('error', 'Produk tidak bisa dihapus karena sudah memiliki riwayat mutasi stok. Anda bisa menonaktifkannya (Opsional).');
        }

        $product->delete();
        return redirect()->back()->with('success', 'Produk berhasil dihapus secara permanen.');
    }
}
import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    Box,
    ArrowUpDown,
    Printer,
} from 'lucide-react';
import { useDebounce } from 'use-debounce';
import AddProductModal from './partials/add-product-modal';
import EditProductModal from './partials/edit-product-modal';
import DeleteProductModal from './partials/delete-product-modal';
import { usePermission } from '@/hooks/usePermission';
import { DataTable, ColumnDef } from '@/components/data-table';

export default function ProductsIndex({ products, filters = {} }: any) {
    const { hasPermission } = usePermission();

    const formatRp = (angka: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(angka || 0);

    const safeSearch = typeof filters?.search === 'string' ? filters.search : '';
    const safeStatus = typeof filters?.status === 'string' ? filters.status : 'all';
    const safeSort = typeof filters?.sort === 'string' ? filters.sort : 'newest';

    // State Management
    const [searchTerm, setSearchTerm] = useState(safeSearch);
    const [statusFilter, setStatusFilter] = useState(safeStatus);
    const [sortTerm, setSortTerm] = useState(safeSort);
    const [debouncedSearch] = useDebounce(searchTerm, 300);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [deletingProduct, setDeletingProduct] = useState<any>(null);

    const applyFilters = (search: string, status: string, sort: string) => {
        router.get(
            route('products.index'),
            {
                search,
                status: status === 'all' ? '' : status,
                sort,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    // Filter Pencarian Debounced
    useEffect(() => {
        if (debouncedSearch !== safeSearch) {
            applyFilters(debouncedSearch, statusFilter, sortTerm);
        }
    }, [debouncedSearch]);

    // Ekstraksi data dari Laravel API Resource
    const productList = products?.data || products || [];
    const meta = products?.meta || products || {};
    const startingIndex = meta?.from ?? products?.from ?? 1;
    const totalCount = meta?.total ?? products?.total ?? 0;
    const toCount = meta?.to ?? products?.to ?? 0;
    const fromCount = meta?.from ?? products?.from ?? 0;
    const paginationLinks = products?.links || meta?.links || [];

    const columns: ColumnDef<any>[] = [
        {
            header: <span className="text-center block">No</span>,
            className: 'w-12 text-center text-slate-400 font-medium',
            render: (_, index) => startingIndex + index,
        },
        {
            header: 'SKU (Kode Barang)',
            className: 'font-mono font-semibold text-blue-600 whitespace-nowrap',
            accessor: 'sku',
        },
        {
            header: 'Nama Produk',
            className: 'font-semibold text-slate-800',
            accessor: 'name',
        },
        {
            header: <span className="text-right block">Harga Jual Dasar</span>,
            className: 'text-right font-mono font-semibold text-slate-700 whitespace-nowrap',
            render: (product) => formatRp(product.price),
        },
        {
            header: <span className="text-center block">Stok Fisik</span>,
            className: 'text-center whitespace-nowrap',
            render: (product) => (
                <Badge
                    variant={
                        product.stock <= 5
                            ? 'destructive'
                            : product.stock <= 20
                              ? 'secondary'
                              : 'outline'
                    }
                    className={`px-3 py-1 font-mono text-xs ${
                        product.stock > 20
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : product.stock <= 20 && product.stock > 5
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : ''
                    }`}
                >
                    {product.stock} Unit
                </Badge>
            ),
        },
        {
            header: <span className="text-center block">Dibuat Oleh</span>,
            className: 'text-center whitespace-nowrap',
            render: (product) => (
                <Badge
                    variant="outline"
                    className="px-3 py-1 text-xs bg-slate-50 text-slate-700 border-slate-200 font-normal"
                >
                    {product.creator?.name || 'Sistem'}
                </Badge>
            ),
        },
        {
            header: <span className="text-center block">Aksi</span>,
            className: 'text-center w-32',
            render: (product) => (
                <div className="flex items-center justify-center gap-2">
                    {hasPermission('products.update') && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-slate-600 hover:bg-slate-100 bg-white"
                            onClick={() => setEditingProduct(product)}
                        >
                            <Pencil className="size-3.5" />
                        </Button>
                    )}
                    {hasPermission('products.delete') && (
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-200"
                            onClick={() => setDeletingProduct(product)}
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Master Data Produk" />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <Box className="size-8 text-primary" /> Master Data Produk
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Kelola daftar barang fisik (SKU), harga, dan pantau ketersediaan stok gudang Anda.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                applyFilters(searchTerm, statusFilter, sortTerm);
                            }}
                            className="relative w-full sm:w-64"
                        >
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Cari nama atau SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white"
                            />
                        </form>

                        <div className="relative w-full sm:w-48">
                            <ArrowUpDown className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                            <select
                                value={sortTerm}
                                onChange={(e) => {
                                    setSortTerm(e.target.value);
                                    applyFilters(searchTerm, statusFilter, e.target.value);
                                }}
                                className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-input rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
                            >
                                <option value="newest">Terbaru Dibuat</option>
                                <option value="oldest">Terlama Dibuat</option>
                                <option value="name_asc">Nama Produk (A - Z)</option>
                                <option value="name_desc">Nama Produk (Z - A)</option>
                                <option value="highest_price">Harga Tertinggi</option>
                                <option value="lowest_price">Harga Terendah</option>
                                <option value="highest_stock">Stok Terbanyak</option>
                                <option value="lowest_stock">Stok Paling Sedikit</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {hasPermission('products.create') && (
                            <Button
                                onClick={() => setIsAddModalOpen(true)}
                                className="shrink-0 gap-2 shadow-sm w-full sm:w-auto"
                            >
                                <Plus className="size-4" /> Tambah Barang
                            </Button>
                        )}
                    </div>
                </div>

                {/* FILTER STATUS */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {[
                                { value: 'all', label: 'Semua' },
                                { value: 'in_stock', label: 'Stok Aman (> 20)' },
                                { value: 'low_stock', label: 'Stok Menipis (1 - 20)' },
                                { value: 'out_of_stock', label: 'Stok Habis (0)' },
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => {
                                        setStatusFilter(tab.value);
                                        applyFilters(searchTerm, tab.value, sortTerm);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                        statusFilter === tab.value
                                            ? 'bg-slate-800 text-white shadow-xs'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {totalCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                                Menampilkan {fromCount} - {toCount} dari {totalCount} produk
                            </span>
                        )}
                    </div>

                    <DataTable
                        data={productList}
                        columns={columns}
                        emptyMessage="Belum ada produk yang terdaftar, atau kata kunci tidak ditemukan."
                        // renderBulks
                    />

                    {/* PAGINATION */}
                    {paginationLinks && paginationLinks.length > 3 && (
                        <div className="flex items-center justify-center sm:justify-between pt-2">
                            <span className="text-sm text-muted-foreground hidden sm:block">
                                Menampilkan {fromCount} - {toCount} dari {totalCount} data
                            </span>
                            <div className="flex gap-1 flex-wrap">
                                {paginationLinks.map((link: any, index: number) => {
                                    const label = link.label
                                        .replace('&laquo; Previous', 'Sebelumnya')
                                        .replace('Next &raquo;', 'Selanjutnya');
                                    return link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            preserveScroll
                                            className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: label }}
                                        />
                                    ) : (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 text-sm border rounded-md text-muted-foreground bg-slate-50 border-slate-200 cursor-not-allowed"
                                            dangerouslySetInnerHTML={{ __html: label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* KOMPONEN MODAL */}
            <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} />
            <DeleteProductModal product={deletingProduct} onClose={() => setDeletingProduct(null)} />
        </AppLayout>
    );
}
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    PackageCheck,
    Truck,
    ClipboardList,
    Clock,
    ArrowUpDown,
    Printer,
    Trash2,
} from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { DataTable, ColumnDef } from '@/components/data-table';

export default function GoodsReceiptsIndex({ goodsReceipts, pendingPOs, filters = {} }: any) {
    const { hasPermission } = usePermission();

    const safeSearch = typeof filters?.search === 'string' ? filters.search : '';
    const safeStatus = typeof filters?.status === 'string' ? filters.status : 'all';
    const safeSort = typeof filters?.sort === 'string' ? filters.sort : 'newest';

    const [searchTerm, setSearchTerm] = useState(safeSearch);
    const [statusFilter, setStatusFilter] = useState(safeStatus);
    const [sortTerm, setSortTerm] = useState(safeSort);

    const applyFilters = (search: string, status: string, sort: string) => {
        router.get(
            route('goods-receipts.index'),
            {
                search,
                status: status === 'all' ? '' : status,
                sort,
            },
            { preserveState: true, replace: true }
        );
    };

    const formatDate = (dateStr: string) =>
        dateStr
            ? new Date(dateStr).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
              })
            : '-';

    const grList = goodsReceipts?.data || goodsReceipts || [];
    const pendingPoList = pendingPOs?.data || pendingPOs || [];
    const startingIndex = goodsReceipts?.meta?.from ?? goodsReceipts?.from ?? 1;

    const columns: ColumnDef<any>[] = [
        {
            header: <span className="text-center block">No</span>,
            className: 'w-12 text-center text-slate-400 font-medium',
            render: (_, index) => startingIndex + index,
        },
        {
            header: 'Tanggal Terima',
            render: (gr) => (
                <>
                    {formatDate(gr.receipt_date)}
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                        Oleh: {gr.created_by?.name || gr.creator?.name || 'Sistem'}
                    </p>
                </>
            ),
        },
        {
            header: 'Nomor GR',
            className: 'font-mono font-semibold text-blue-600 whitespace-nowrap',
            accessor: 'gr_number',
        },
        {
            header: 'Sumber Data',
            render: (gr) =>
                gr.purchase_order ? (
                    <span className="font-mono text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {gr.purchase_order.po_number}
                    </span>
                ) : (
                    <span className="text-xs text-slate-500">Input Manual</span>
                ),
        },
        {
            header: 'Nama Supplier',
            accessor: 'supplier_name',
        },
        {
            header: 'Status Fisik',
            render: (gr) =>
                gr.status === 'received' ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
                        Barang Diterima
                    </Badge>
                ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Menunggu
                    </Badge>
                ),
        },
        {
            header: 'Penanggung Jawab',
            render: (gr) => (
                <span className="text-sm text-slate-600">
                    {gr.responsible_person?.name || '-'}
                </span>
            ),
        },
        {
            header: <span className="text-center block">Aksi</span>,
            className: 'text-center',
            render: (gr) => (
                <Button asChild variant="outline" size="sm" className="hover:text-primary hover:bg-blue-50 bg-white">
                    <Link href={route('goods-receipts.show', gr.id)}>Detail</Link>
                </Button>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Penerimaan Barang (GR)" />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <PackageCheck className="size-8 text-emerald-600" /> Penerimaan Barang (GR)
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Kelola antrean kedatangan barang dari Pemasok dan catat penerimaan fisik ke dalam gudang.
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
                                placeholder="Cari No GR / PO / Pemasok..."
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
                                <option value="receipt_newest">Tgl Terima Terbaru</option>
                                <option value="receipt_oldest">Tgl Terima Terlama</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {hasPermission('goods_receipts.create') && (
                            <Button asChild className="shrink-0 gap-2 shadow-sm w-full sm:w-auto">
                                <Link href={route('goods-receipts.create')}>
                                    <ClipboardList className="size-4" /> Input Manual
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* ANTREAN PO */}
                {pendingPoList.length > 0 && (
                    <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                                <Truck className="size-4 text-blue-600" />
                                Antrean Kedatangan dari Pemasok ({pendingPoList.length})
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {pendingPoList.map((po: any) => (
                                <div
                                    key={po.id}
                                    className="bg-white px-4 py-3 rounded-lg border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-blue-600">
                                                {po.po_number}
                                            </span>
                                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                <Clock className="size-3" /> {formatDate(po.order_date)}
                                            </span>
                                        </div>
                                        <p className="font-medium text-sm text-slate-800 truncate mt-0.5">
                                            {po.supplier_name}
                                        </p>
                                    </div>
                                    <Button asChild size="sm" variant="outline" className="shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                                        <Link href={route('purchase-orders.create-gr', po.id)}>
                                            Terima
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB FILTER STATUS */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-1.5">
                        {[
                            { value: 'all', label: 'Semua' },
                            { value: 'received', label: 'Masuk Stok Gudang Gudang' },
                            { value: 'not_received', label: 'Tidak Masuk Stok Gudang' },
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

                    {/* TABEL UTAMA */}
                    <DataTable
                        data={grList}
                        columns={columns}
                        emptyMessage="Belum ada Riwayat Bukti Terima (GR) yang dicatat."
                        // renderBulk
                    />
                </div>
            </div>
        </AppLayout>
    );
}
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Truck,
    Search,
    MapPin,
    Clock,
    PackageCheck,
    ArrowUpDown,
    Printer,
    Trash2,
    FolderOpen,
} from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { DataTable, ColumnDef } from '@/components/data-table';

export default function DeliveryOrderIndex({ deliveryOrders, filters = {}, pendingSalesOrders }: any) {
    const { hasPermission } = usePermission();

    const safeSearch = typeof filters?.search === 'string' ? filters.search : '';
    const safeSort = typeof filters?.sort === 'string' ? filters.sort : 'newest';

    const [searchTerm, setSearchTerm] = useState(safeSearch);
    const [sortTerm, setSortTerm] = useState(safeSort);

    const applyFilters = (search: string, sort: string) => {
        router.get(
            route('delivery-orders.index'),
            { search, sort },
            { preserveState: true, replace: true }
        );
    };

    const formatDate = (dateStr: string) =>
        dateStr
            ? new Date(dateStr).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
              })
            : '-';

    const doList = deliveryOrders?.data || deliveryOrders || [];
    const meta = deliveryOrders?.meta || deliveryOrders || {};
    const startingIndex = meta?.from ?? 1;

    const columns: ColumnDef<any>[] = [
        {
            header: <span className="text-center block">No</span>,
            className: 'w-12 text-center text-slate-400 font-medium',
            render: (_, index) => startingIndex + index,
        },
        {
            header: 'No. Surat Jalan',
            className: 'font-mono font-semibold text-blue-600 whitespace-nowrap',
            accessor: 'do_number',
        },
        {
            header: 'Ref. Pesanan (SO)',
            className: 'whitespace-nowrap',
            render: (order) =>
                order.sales_order ? (
                    <span className="font-mono text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {order.sales_order.so_number}
                    </span>
                ) : (
                    <span className="text-xs text-slate-400">-</span>
                ),
        },
        {
            header: 'Penerima & Lokasi',
            render: (order) => (
                <div>
                    <p className="font-semibold text-slate-800">{order.client_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3" /> Tujuan Pengiriman
                    </p>
                </div>
            ),
        },
        {
            header: 'Info Ekspedisi',
            render: (order) => (
                <div>
                    <p className="text-slate-800 font-medium">{order.driver_name || 'Supir: -'}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        Plat: {order.vehicle_number || '-'}
                    </p>
                </div>
            ),
        },
        {
            header: <span className="text-center block">Tgl Kirim</span>,
            render: (order) => formatDate(order.delivery_date),
        },
        {
            header: <span className="text-center block">Aksi</span>,
            className: 'text-center',
            render: (order) => (
                <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 bg-white gap-1.5"
                    asChild
                >
                    <Link href={route('delivery-orders.show', order.id)}>
                        <FolderOpen className="size-3.5" /> Lihat Detail
                    </Link>
                </Button>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Daftar Surat Jalan (DO)" />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* HEADER & TOOLBAR */}
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <Truck className="size-8 text-primary" /> Manajemen Pengiriman (DO)
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Pantau riwayat pengiriman fisik barang ke lokasi klien secara real-time.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                applyFilters(searchTerm, sortTerm);
                            }}
                            className="relative w-full sm:w-64"
                        >
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Cari No. DO / SO / Plat..."
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
                                    applyFilters(searchTerm, e.target.value);
                                }}
                                className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-input rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
                            >
                                <option value="newest">Terbaru Dibuat</option>
                                <option value="oldest">Terlama Dibuat</option>
                                <option value="delivery_newest">Tgl Kirim Terbaru</option>
                                <option value="delivery_oldest">Tgl Kirim Terlama</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ANTREAN PENGIRIMAN DARI SO (Desain Ringkas Tanpa Card Bertumpuk) */}
                {pendingSalesOrders && pendingSalesOrders.length > 0 && (
                    <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                                <Truck className="size-4 text-amber-600" />
                                Antrean Pengiriman ke Klien ({pendingSalesOrders.length})
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {pendingSalesOrders.map((so: any) => (
                                <div
                                    key={so.id}
                                    className="bg-white px-4 py-3 rounded-lg border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-amber-700">
                                                {so.so_number}
                                            </span>
                                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                <Clock className="size-3" /> {formatDate(so.order_date)}
                                            </span>
                                        </div>
                                        <p className="font-medium text-sm text-slate-800 truncate mt-0.5">
                                            {so.client_name}
                                        </p>
                                    </div>
                                    <Button
                                        asChild
                                        size="sm"
                                        variant="outline"
                                        className="shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 gap-1.5"
                                    >
                                        <Link href={route('sales-orders.convert-do', so.id)}>
                                            <PackageCheck className="size-3.5" /> Buat SJ
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TABEL UTAMA & INFO JUMLAH DATA */}
                <div className="flex flex-col gap-3">
                    {meta?.total !== undefined && (
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">
                                Riwayat Pengiriman (Logistik)
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Menampilkan {doList.length} dari {meta.total} dokumen pengiriman
                            </span>
                        </div>
                    )}

                    <DataTable
                        data={doList}
                        columns={columns}
                        emptyMessage="Belum ada riwayat surat jalan. Buat pengiriman melalui antrean Sales Order."
                        renderBulkActions={(selectedIds, clearSelection) => (
                            <Button
                                size="sm"
                                className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                    const url = route('delivery-orders.print-bulk', {
                                        ids: selectedIds.join(','),
                                    });
                                    window.open(url, '_blank', 'noopener,noreferrer');
                                    clearSelection();
                                }}
                            >
                                <Printer className="size-3.5" /> Cetak Surat Jalan Terpilih ({selectedIds.length})
                            </Button>
                        )}
                    />

                    {/* PAGINATION */}
                    {meta?.links && meta.links.length > 3 && (
                        <div className="flex items-center justify-center sm:justify-between pt-2">
                            <span className="text-sm text-muted-foreground hidden sm:block">
                                Halaman {meta.current_page} dari {meta.last_page}
                            </span>
                            <div className="flex gap-1 flex-wrap">
                                {meta.links.map((link: any, index: number) => {
                                    const label = link.label
                                        .replace('&laquo; Previous', 'Sebelumnya')
                                        .replace('Next &raquo;', 'Selanjutnya');
                                    return link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
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
        </AppLayout>
    );
}
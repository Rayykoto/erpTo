import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    ShoppingCart,
    Search,
    Plus,
    ArrowRightCircle,
    FolderOpen,
    ArrowUpDown,
    Printer,
    Trash2,
} from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { DataTable, ColumnDef } from '@/components/data-table';

export default function SalesOrderIndex({ salesOrders, filters = {} }: any) {
    const { hasPermission } = usePermission();

    const safeSearch = typeof filters?.search === 'string' ? filters.search : '';
    const safeStatus = typeof filters?.status === 'string' ? filters.status : 'all';
    const safeSort = typeof filters?.sort === 'string' ? filters.sort : 'newest';

    const [searchTerm, setSearchTerm] = useState(safeSearch);
    const [statusFilter, setStatusFilter] = useState(safeStatus);
    const [sortTerm, setSortTerm] = useState(safeSort);

    const applyFilters = (search: string, status: string, sort: string) => {
        router.get(
            route('sales-orders.index'),
            {
                search,
                status: status === 'all' ? '' : status,
                sort,
            },
            { preserveState: true, replace: true }
        );
    };

    const formatRp = (angka: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(angka || 0);

    const formatDate = (dateStr: string) =>
        dateStr
            ? new Date(dateStr).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
              })
            : '-';

    const soList = salesOrders?.data || salesOrders || [];
    const meta = salesOrders?.meta || salesOrders || {};
    const startingIndex = meta?.from ?? 1;

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px] px-2 py-0.5 tracking-wider">
                        Confirmed
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 uppercase text-[10px] px-2 py-0.5 tracking-wider">
                        Completed
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 uppercase text-[10px] px-2 py-0.5 tracking-wider">
                        Cancelled
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 uppercase text-[10px] px-2 py-0.5 tracking-wider">
                        {status || 'Pending'}
                    </Badge>
                );
        }
    };

    const columns: ColumnDef<any>[] = [
        {
            header: <span className="text-center block">No</span>,
            className: 'w-12 text-center text-slate-400 font-medium',
            render: (_, index) => startingIndex + index,
        },
        {
            header: 'No. SO',
            className: 'font-mono font-semibold text-blue-600 whitespace-nowrap',
            accessor: 'so_number',
        },
        {
            header: 'Klien & Sales',
            render: (order) => (
                <div>
                    <p className="font-semibold text-slate-800">{order.client_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <ArrowRightCircle className="size-3" />
                        Sales: {order.sales_person ? order.sales_person.name : '-'}
                    </p>
                </div>
            ),
        },
        {
            header: 'Tgl Pesanan',
            render: (order) => formatDate(order.order_date),
        },
        {
            header: <span className="block">Nilai Total</span>,
            className: 'text-right font-semibold whitespace-nowrap',
            render: (order) => formatRp(order.grand_total),
        },
        {
            header: <span className="text-center block">Status</span>,
            className: 'text-center',
            render: (order) => getStatusBadge(order.status),
        },
        {
            header: <span className="text-center block">Aksi</span>,
            className: 'text-center',
            render: (order) => (
                <Button
                    size="sm"
                    variant="outline"
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 bg-white gap-1.5"
                    asChild
                >
                    <Link href={route('sales-orders.show', order.id)}>
                        <FolderOpen className="size-3.5" /> Cek Detail SO
                    </Link>
                </Button>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Daftar Sales Order" />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <ShoppingCart className="size-8 text-primary" /> Daftar Sales Order
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Kelola pesanan klien (PO) dan teruskan ke dokumen penagihan atau pengiriman.
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
                                placeholder="Cari No. SO / Klien / Sales..."
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
                                <option value="order_newest">Tgl Pesanan Terbaru</option>
                                <option value="order_oldest">Tgl Pesanan Terlama</option>
                                <option value="highest_value">Nilai Tertinggi</option>
                                <option value="lowest_value">Nilai Terendah</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {hasPermission('sales_orders.create') && (
                            <Button asChild className="shrink-0 gap-2 shadow-sm w-full sm:w-auto">
                                <Link href={route('sales-orders.create')}>
                                    <Plus className="size-4" /> Buat SO Baru
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {[
                                { value: 'all', label: 'Semua' },
                                { value: 'Pending', label: 'Pending' },
                                { value: 'confirmed', label: 'Confirmed' },
                                { value: 'completed', label: 'Completed' },
                                { value: 'cancelled', label: 'Cancelled' },
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

                        {meta?.total !== undefined && (
                            <span className="text-xs text-muted-foreground">
                                Menampilkan {soList.length} dari {meta.total} pesanan
                            </span>
                        )}
                    </div>

                    <DataTable
                        data={soList}
                        columns={columns}
                        emptyMessage="Belum ada data Sales Order."
                        // renderBulkActions
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
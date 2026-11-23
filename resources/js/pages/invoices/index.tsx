import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    CheckCircle,
    Clock,
    Plus,
    ArrowRightCircle,
    Truck,
    FileOutput,
    Receipt,
    AlertCircle,
    Link as LinkIcon,
    ArrowUpDown,
    Printer,
    FolderOpen,
} from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { DataTable, ColumnDef } from '@/components/data-table';

export default function InvoiceIndex({ invoices, filters = {}, pendingDeliveryOrders }: any) {
    const { hasPermission } = usePermission();
    console.log('invoices:', invoices);

    const safeSearch = typeof filters?.search === 'string' ? filters.search : '';
    const safeStatus = typeof filters?.status === 'string' ? filters.status : 'all';
    const safeSort = typeof filters?.sort === 'string' ? filters.sort : 'newest';

    const [searchTerm, setSearchTerm] = useState(safeSearch);
    const [statusFilter, setStatusFilter] = useState(safeStatus);
    const [sortTerm, setSortTerm] = useState(safeSort);

    const applyFilters = (search: string, status: string, sort: string) => {
        router.get(
            route('invoices.index'),
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

    const invoiceList = invoices?.data || invoices || [];
    const meta = invoices?.meta || invoices || {};
    const invoiceLinks = invoices?.links || meta?.links || [];
    const pendingDOList = pendingDeliveryOrders?.data || pendingDeliveryOrders || [];
    const startingIndex = meta?.from ?? 1;

    const columns: ColumnDef<any>[] = [
        {
            header: <span className="text-center block">No</span>,
            className: 'w-12 text-center text-slate-400 font-medium',
            render: (_, index) => startingIndex + index,
        },
        {
            header: 'Faktur & Referensi',
            className: 'font-mono font-semibold text-blue-600 whitespace-nowrap',
            render: (invoice) => (
                <div>
                    <span>{invoice.invoice_number}</span>
                    {(invoice.sales_order || invoice.delivery_order) && (
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            {invoice.delivery_order && (
                                <Link
                                    href={route('delivery-orders.show', invoice.delivery_order.id)}
                                    className="text-[11px] text-slate-500 font-mono flex items-center gap-1 hover:text-emerald-600 transition-colors"
                                >
                                    <LinkIcon className="size-2.5 text-emerald-500" />
                                    {invoice.delivery_order.do_number}
                                </Link>
                            )}
                            {invoice.sales_order && (
                                <Link
                                    href={route('sales-orders.show', invoice.sales_order.id)}
                                    className="text-[11px] text-slate-500 font-mono flex items-center gap-1 hover:text-indigo-600 transition-colors"
                                >
                                    <LinkIcon className="size-2.5 text-indigo-500" />
                                    {invoice.sales_order.so_number}
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: 'Klien & Sales',
            render: (invoice) => (
                <div>
                    <p className="font-semibold text-slate-800">{invoice.client_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <ArrowRightCircle className="size-3" />
                        Sales: {invoice.sales_person ? invoice.sales_person.name : 'Sistem'}
                    </p>
                </div>
            ),
        },
        {
            header: 'Tanggal Terbit',
            className: 'whitespace-nowrap',
            render: (invoice) => (
                <div>
                    <p className="text-slate-700 font-medium">{formatDate(invoice.issue_date)}</p>
                    {invoice.due_date && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Jatuh tempo: {formatDate(invoice.due_date)}
                        </p>
                    )}
                </div>
            ),
        },
        {
            header: <span className="text-right block">Total Tagihan</span>,
            className: 'text-right',
            render: (invoice) => formatRp(invoice.grand_total),
        },
        {
            header: <span className="text-center block">Status</span>,
            className: 'text-center',
            render: (invoice) =>
                invoice.status === 'paid' ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 gap-1">
                        <CheckCircle className="size-3" /> Lunas
                    </Badge>
                ) : invoice.status === 'partial' ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                        <Clock className="size-3" /> Dicicil
                    </Badge>
                ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                        <AlertCircle className="size-3" /> Belum Lunas
                    </Badge>
                ),
        },
        {
            header: <span className="text-center block">Aksi</span>,
            className: 'text-center',
            render: (invoice) =>
                hasPermission('invoices.view') ? (
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 bg-white gap-1.5"
                        asChild
                    >
                        <Link href={route('invoices.show', invoice.id)}>
                            <FolderOpen className="size-3.5" /> Detail
                        </Link>
                    </Button>
                ) : (
                    <span className="text-xs text-slate-400">-</span>
                ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Daftar Faktur (Invoice)" />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* HEADER & TOOLBAR */}
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <Receipt className="size-8 text-primary" /> Daftar Faktur
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Kelola tagihan klien, pantau status pembayaran, dan distribusikan pencapaian.
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
                                placeholder="Cari No. Faktur / Klien / DO..."
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
                                <option value="issue_newest">Tgl Terbit Terbaru</option>
                                <option value="issue_oldest">Tgl Terbit Terlama</option>
                                <option value="due_nearest">Jatuh Tempo Terdekat</option>
                                <option value="highest_value">Tagihan Tertinggi</option>
                                <option value="lowest_value">Tagihan Terendah</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {hasPermission('invoices.create') && (
                            <Button asChild className="shrink-0 gap-2 shadow-sm w-full sm:w-auto">
                                <Link href={route('invoices.create')}>
                                    <Plus className="size-4" /> Buat Faktur
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* ANTREAN PENAGIHAN KLIEN */}
                {pendingDOList.length > 0 && (
                    <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                                <FileOutput className="size-4 text-blue-600" />
                                Antrean Penagihan Klien ({pendingDOList.length} Surat Jalan Selesai)
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {pendingDOList.map((doItem: any) => (
                                <div
                                    key={doItem.id}
                                    className="bg-white px-4 py-3 rounded-lg border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Link
                                                href={route('delivery-orders.show', doItem.id)}
                                                className="font-mono text-xs font-bold text-blue-600 hover:underline"
                                            >
                                                {doItem.do_number}
                                            </Link>
                                            {doItem.sales_order && (
                                                <Link
                                                    href={route('sales-orders.show', doItem.sales_order.id)}
                                                    className="font-mono text-[11px] text-indigo-600 hover:underline"
                                                >
                                                    ({doItem.sales_order.so_number})
                                                </Link>
                                            )}
                                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                <Truck className="size-3" /> {formatDate(doItem.delivered_at)}
                                            </span>
                                        </div>
                                        <p className="font-medium text-sm text-slate-800 truncate mt-0.5">
                                            {doItem.client_name}
                                        </p>
                                    </div>
                                    <Button
                                        asChild
                                        size="sm"
                                        variant="outline"
                                        className="shrink-0 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                                    >
                                        <Link href={route('invoices.create', { source_do_id: doItem.id })}>
                                            Tagih
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FILTER STATUS */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {[
                                { value: 'all', label: 'Semua' },
                                { value: 'unpaid', label: 'Belum Lunas' },
                                { value: 'partial', label: 'Dicicil' },
                                { value: 'paid', label: 'Lunas' },
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
                                Menampilkan {invoiceList.length} dari {meta.total} faktur
                            </span>
                        )}
                    </div>

                    <DataTable
                        data={invoiceList}
                        columns={columns}
                        emptyMessage="Belum ada data faktur yang ditemukan."
                        renderBulkActions={(selectedIds, clearSelection) => (
                            <Button
                                size="sm"
                                className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                    const url = route('invoices.print-bulk', {
                                        ids: selectedIds.join(','),
                                    });
                                    window.open(url, '_blank', 'noopener,noreferrer');
                                    clearSelection();
                                }}
                            >
                                <Printer className="size-3.5" /> Cetak Faktur Terpilih ({selectedIds.length})
                            </Button>
                        )}
                    />

                    {/* PAGINATION */}
                    {invoiceLinks && invoiceLinks.length > 3 && (
                        <div className="flex items-center justify-center sm:justify-between pt-2">
                            <span className="text-sm text-muted-foreground hidden sm:block">
                                Halaman {meta.current_page || 1} dari {meta.last_page || 1}
                            </span>
                            <div className="flex gap-1 flex-wrap">
                                {invoiceLinks.map((link: any, index: number) => {
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
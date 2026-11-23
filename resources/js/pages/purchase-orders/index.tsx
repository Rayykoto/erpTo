import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Store, CheckCircle2, XCircle, Clock, ArrowUpDown, Trash2 } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { DataTable, ColumnDef } from '@/components/data-table'; 

export default function PurchaseOrdersIndex({ purchaseOrders, filters = {} }: any) {
    const { hasPermission } = usePermission();
    
    const safeSearch = typeof filters?.search === 'string' ? filters.search : '';
    const safeSort = typeof filters?.sort === 'string' ? filters.sort : 'newest';

    const [searchTerm, setSearchTerm] = useState(safeSearch);
    const [sortTerm, setSortTerm] = useState(safeSort);

    const applyFilters = (search: string, sort: string) => {
        router.get(route('purchase-orders.index'), { search, sort }, { preserveState: true, replace: true });
    };

    const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
    const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

    const poList = purchaseOrders?.data || purchaseOrders || [];
    const startingIndex = purchaseOrders?.meta?.from ?? purchaseOrders?.from ?? 1;

    const columns: ColumnDef<any>[] = [
        {
            header: <span className="text-center block">No</span>,
            className: "w-12 text-center text-slate-400 font-medium",
            render: (_, index) => startingIndex + index,
        },
        {
            header: "Tanggal Pesanan",
            render: (po) => (
                <>
                    {formatDate(po.order_date)}
                    <p className="text-[10px] text-muted-foreground mt-0.5">Oleh: {po.creator?.name || 'Sistem'}</p>
                </>
            ),
        },
        {
            header: "Nomor PO",
            className: 'font-mono font-semibold text-blue-600 whitespace-nowrap',
            accessor: "po_number",
        },
        {
            header: "Nama Supplier",
            accessor: "supplier_name",
        },
        {
            header: "Nilai Total (Rp)",
            render: (po) => formatRp(po.grand_total),
        },
        {
            header: "Persetujuan",
            render: (po) => (
                <div>
                    {po.approval_status === 'approved' && <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200"><CheckCircle2 className="size-3 mr-1" /> Disetujui</Badge>}
                    {po.approval_status === 'rejected' && <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200"><XCircle className="size-3 mr-1" /> Ditolak</Badge>}
                    {po.approval_status === 'waiting' && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="size-3 mr-1" /> Menunggu</Badge>}
                    
                    {po.approval_status !== 'waiting' && po.approver && (
                        <span className="flex text-[10px] text-muted-foreground truncate max-w-[100px] mt-0.5">Disetujui:{po.approver.name}</span>
                    )}
                </div>
            ),
        },
        {
            header: "Aksi",
            className: "text-center",
            render: (po) => (
                <Button asChild variant="outline" size="sm" className="hover:text-primary hover:bg-blue-50 bg-white">
                    <Link href={route('purchase-orders.show', po.id)}>Tinjau</Link>
                </Button>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Purchase Orders" />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <Store className="size-8 text-primary" /> Purchase Orders (PO)
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Catat pesanan barang dari perusahaan ke Supplier / Pemasok untuk dikirimkan ke gudang.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <form onSubmit={(e) => { e.preventDefault(); applyFilters(searchTerm, sortTerm); }} className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="Cari No PO / Pemasok..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 bg-white" />
                        </form>

                        <div className="relative w-full sm:w-48">
                            <ArrowUpDown className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                            <select
                                value={sortTerm}
                                onChange={(e) => { setSortTerm(e.target.value); applyFilters(searchTerm, e.target.value); }}
                                className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-input rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
                            >
                                <option value="newest">Terbaru Dibuat</option>
                                <option value="oldest">Terlama Dibuat</option>
                                <option value="highest_value">Nilai Tertinggi</option>
                                <option value="lowest_value">Nilai Terendah</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
                        </div>

                        {hasPermission('purchase_orders.create') && (
                            <Button asChild className="shrink-0 gap-2 shadow-sm w-full sm:w-auto">
                                <Link href={route('purchase-orders.create')}><Plus className="size-4" /> Buat PO</Link>
                            </Button>
                        )}
                    </div>
                </div>

                <DataTable 
                    data={poList} 
                    columns={columns} 
                    emptyMessage="Belum ada Purchase Order (PO) yang diterbitkan."
                    //bulk
                />
                
            </div>
        </AppLayout>
    );
}
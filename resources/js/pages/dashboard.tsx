import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/usePermission'; // Import hook permission

import { 
    Banknote, 
    TrendingUp, 
    ShieldAlert, 
    Target, 
    ArrowRight, 
    AlertCircle, 
    Clock, 
    FileText 
} from 'lucide-react';

export default function DashboardIndex({ metrics, recentUnpaidInvoices }: any) {
    const { hasPermission, hasAnyPermission } = usePermission();
    
    const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    const targetPercentage = metrics.my_target > 0 
        ? Math.min(Math.round((metrics.my_achievement / metrics.my_target) * 100), 100) 
        : 0;

    return (
        <AppLayout>
            <Head title="Dashboard Eksekutif" />

            <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto">
                <div className="mb-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Utama</h1>
                    <p className="text-muted-foreground mt-1">Ringkasan performa finansial dan operasional perusahaan hari ini.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* PENDAPATAN BULAN INI (Hanya Finance, Manager, Owner) */}
                    {hasPermission('invoices.view') && (
                        <Card className="shadow-sm border-t-4 border-t-emerald-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pendapatan Bulan Ini</p>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{formatRp(metrics.monthly_revenue)}</h3>
                                    </div>
                                    <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                        <TrendingUp className="size-6 text-emerald-600" />
                                    </div>
                                </div>
                                <p className="text-xs text-emerald-600 mt-4 font-medium bg-emerald-50 inline-block px-2 py-1 rounded">Dana masuk dari cicilan/lunas</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* TOTAL PIUTANG BERJALAN (Hanya Finance, Manager, Owner) */}
                    {hasPermission('invoices.view') && (
                        <Card className="shadow-sm border-t-4 border-t-rose-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Piutang Berjalan</p>
                                        <h3 className="text-2xl font-black text-rose-700 tracking-tight">{formatRp(metrics.outstanding_receivables)}</h3>
                                    </div>
                                    <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
                                        <Banknote className="size-6 text-rose-600" />
                                    </div>
                                </div>
                                <p className="text-xs text-rose-600 mt-4 font-medium bg-rose-50 inline-block px-2 py-1 rounded">Total uang klien yang belum dibayar</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* MENUNGGU PERSETUJUAN (Hanya Manager & Owner) */}
                    {hasAnyPermission(['sales_orders.approve', 'purchase_orders.approve']) && (
                        <Card className={`shadow-sm border-t-4 ${metrics.pending_approvals > 0 ? 'border-t-amber-500 bg-amber-50/30' : 'border-t-slate-300'}`}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Persetujuan Tertahan</p>
                                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{metrics.pending_approvals} <span className="text-lg font-medium text-slate-500">Dokumen</span></h3>
                                    </div>
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${metrics.pending_approvals > 0 ? 'bg-amber-200' : 'bg-slate-100'}`}>
                                        <ShieldAlert className={`size-6 ${metrics.pending_approvals > 0 ? 'text-amber-700' : 'text-slate-400'}`} />
                                    </div>
                                </div>
                                {metrics.pending_approvals > 0 ? (
                                    <Link href={route('sales-orders.index')} className="text-xs font-bold text-amber-700 mt-4 inline-flex items-center hover:underline">
                                        Tinjau sekarang <ArrowRight className="size-3 ml-1" />
                                    </Link>
                                ) : (
                                    <p className="text-xs text-slate-500 mt-4 font-medium">Semua dokumen besar telah disetujui.</p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* TARGET SALES (Hanya SO Staff, Supervisor, Manager, Owner) */}
                    {hasPermission('sales_visits.view') && (
                        <Card className="shadow-sm border-t-4 border-t-blue-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Target Sales Anda</p>
                                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">{targetPercentage}%</h3>
                                    </div>
                                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                        <Target className="size-6 text-blue-600" />
                                    </div>
                                </div>
                                
                                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${targetPercentage}%` }}></div>
                                </div>
                                
                                <div className="flex justify-between text-xs font-mono text-slate-500">
                                    <span>{formatRp(metrics.my_achievement)}</span>
                                    <span>{formatRp(metrics.my_target)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* TABEL DOKUMEN & JALAN PINTAS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">

                    {hasPermission('invoices.view') && (
                        <Card className="shadow-sm lg:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2 text-rose-700">
                                        <AlertCircle className="size-5" /> Piutang Jatuh Tempo / Mendesak
                                    </CardTitle>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('invoices.index')}>Lihat Semua</Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                                            <tr>
                                                <th className="p-4 pl-6">No. Faktur</th>
                                                <th className="p-4">Klien</th>
                                                <th className="p-4">Jatuh Tempo</th>
                                                <th className="p-4 text-right">Sisa Tagihan</th>
                                                <th className="p-4 pr-6 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {recentUnpaidInvoices.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                                                        Tidak ada piutang tertunggak saat ini. Arus kas dalam kondisi prima.
                                                    </td>
                                                </tr>
                                            ) : (
                                                recentUnpaidInvoices.map((inv: any) => {
                                                    const isOverdue = new Date(inv.due_date) < new Date();
                                                    return (
                                                        <tr key={inv.id} className={`hover:bg-slate-50 ${isOverdue ? 'bg-rose-50/30' : ''}`}>
                                                            <td className="p-4 pl-6 font-mono font-medium text-slate-800">
                                                                {inv.invoice_number}
                                                            </td>
                                                            <td className="p-4 font-semibold text-slate-700">
                                                                {inv.client_name}
                                                                <p className="text-[10px] font-normal text-muted-foreground">Sales: {inv.sales_person?.name}</p>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                                                                    <Clock className="size-3.5" />
                                                                    {formatDate(inv.due_date)}
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-right font-mono font-bold text-rose-700">
                                                                {formatRp(inv.balance_due)}
                                                            </td>
                                                            <td className="p-4 pr-6 text-center">
                                                                <Button size="sm" variant="outline" asChild>
                                                                    <Link href={route('invoices.show', inv.id)}>Buka</Link>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {hasAnyPermission(['sales_orders.create', 'delivery_orders.view']) && (
                        <Card className="shadow-sm">
                            <CardHeader className="pb-4 border-b">
                                <CardTitle className="text-lg">Jalan Pintas Operasional</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                
                                {hasPermission('sales_orders.create') && (
                                    <Button variant="outline" className="w-full justify-start h-12 text-slate-700 hover:text-primary hover:bg-blue-50 border-slate-200" asChild>
                                        <Link href={route('sales-orders.create')}>
                                            <div className="bg-blue-100 p-1.5 rounded mr-3">
                                                <FileText className="size-4 text-blue-600" />
                                            </div>
                                            Buat Sales Order Baru
                                        </Link>
                                    </Button>
                                )}
                                
                                {hasPermission('delivery_orders.view') && (
                                    <Button variant="outline" className="w-full justify-start h-12 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 border-slate-200" asChild>
                                        <Link href={route('delivery-orders.index')}>
                                            <div className="bg-emerald-100 p-1.5 rounded mr-3">
                                                <ArrowRight className="size-4 text-emerald-600" />
                                            </div>
                                            Tinjau Antrean Pengiriman
                                        </Link>
                                    </Button>
                                )}
                                
                            </CardContent>
                        </Card>
                    )}

                </div>
            </div>
        </AppLayout>
    );
}
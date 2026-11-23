import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Store, Package, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function PurchaseOrderShow({ purchaseOrder }: any) {
    const { hasPermission } = usePermission();
    
    // Amankan data dari pembungkus "data" API Resource Laravel
    const po = purchaseOrder?.data || purchaseOrder;

    const [isProcessing, setIsProcessing] = useState(false);

    const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
    const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

    // Handler Eksekusi Persetujuan
    const handleApprove = () => {
        setIsProcessing(true);
        router.post(route('purchase-orders.approve', po.id), {}, {
            preserveScroll: true,
            onFinish: () => setIsProcessing(false),
        });
    };

    // Handler Eksekusi Penolakan
    const handleReject = () => {
        setIsProcessing(true);
        router.post(route('purchase-orders.reject', po.id), {}, {
            preserveScroll: true,
            onFinish: () => setIsProcessing(false),
        });
    };

    // Helper Visual Status Persetujuan
    const renderApprovalBadge = () => {
        switch (po.approval_status) {
            case 'approved':
                return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent px-3 py-1 flex gap-1.5 items-center"><CheckCircle2 className="size-4" /> Disetujui</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300 px-3 py-1 flex gap-1.5 items-center"><XCircle className="size-4" /> Ditolak</Badge>;
            case 'waiting':
            default:
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 px-3 py-1 flex gap-1.5 items-center"><Clock className="size-4" /> Menunggu Persetujuan</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title={`Detail PO - ${po.po_number}`} />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* HEADER NAVIGASI */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                            <ArrowLeft className="size-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Store className="size-6 text-blue-600" /> {po.po_number}
                            </h1>
                            <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
                                Dibuat oleh: <span className="font-semibold text-slate-700">{po.creator?.name || 'Sistem'}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="uppercase bg-slate-50 text-slate-500 border-slate-200">
                            Status Dokumen: {po.status}
                        </Badge>
                        {renderApprovalBadge()}
                    </div>
                </div>

                {/* BANNER APPROVAL KHUSUS MANAJER */}
                {po.approval_status === 'waiting' && hasPermission('purchase_orders.approve') && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between shadow-sm gap-4">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="size-6 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-bold text-blue-900">Otorisasi Pembelian (Approval)</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    Dokumen ini memerlukan persetujuan Anda sebelum diteruskan ke Pemasok dan Gudang. Total anggaran: <strong>{formatRp(po.grand_total)}</strong>.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex w-full sm:w-auto items-center gap-3 shrink-0">
                            {/* DIALOG TOLAK */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button disabled={isProcessing} variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50 w-full sm:w-auto">
                                        <XCircle className="size-4 mr-2" /> Tolak PO
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2 text-rose-700">
                                            <AlertTriangle className="size-5" /> Tolak Pesanan
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-600">
                                            Apakah Anda yakin ingin menolak Purchase Order ini? Dokumen yang ditolak akan dibatalkan secara permanen.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="mt-4">
                                        <AlertDialogCancel>Kembali</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleReject} className="bg-rose-600 hover:bg-rose-700 text-white">
                                            Ya, Tolak PO
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            {/* DIALOG SETUJUI */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto shadow-md">
                                        <CheckCircle2 className="size-4 mr-2" /> Setujui PO
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2 text-slate-800">
                                            <ShieldCheck className="size-5 text-blue-600" /> Konfirmasi Persetujuan
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-600">
                                            Menyetujui PO ini berarti Anda <strong>mengotorisasi pengeluaran dana</strong> sebesar <strong>{formatRp(po.grand_total)}</strong>. Dokumen akan diteruskan ke tim Gudang untuk proses penerimaan barang. Lanjutkan?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="mt-4">
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleApprove} className="bg-blue-600 hover:bg-blue-700">
                                            Otorisasi & Setujui
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* INFO DOKUMEN */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg">Informasi Dokumen</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Tanggal Pesanan</p>
                                    <p className="font-medium text-slate-800">{formatDate(po.order_date)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Pemasok / Supplier</p>
                                    <p className="font-medium text-slate-800">{po.supplier_name}</p>
                                </div>
                            </div>
                            
                            {po.approval_status !== 'waiting' && po.approver && (
                                <div className="p-3 rounded-md bg-slate-50 border border-slate-100 flex flex-col gap-1">
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Disetujui / Ditolak Oleh</p>
                                    <p className="font-semibold text-slate-700 flex items-center gap-2">
                                        <ShieldCheck className="size-4 text-emerald-600" /> {po.approver.name}
                                    </p>
                                </div>
                            )}

                            {po.notes && (
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Catatan Internal</p>
                                    <p className="text-sm bg-slate-50 p-3 rounded border text-slate-700">{po.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* TABEL BARANG */}
                <Card className="shadow-sm border-t-4 border-t-slate-700">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="size-5 text-slate-700" /> Rincian Pesanan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 text-slate-600 font-medium border-y">
                                    <tr>
                                        <th className="p-4 w-12 text-center">No</th>
                                        <th className="p-4">Deskripsi Barang</th>
                                        <th className="p-4 text-center w-24">Qty</th>
                                        <th className="p-4 text-right w-40">Harga Satuan</th>
                                        <th className="p-4 text-right w-48">Total Harga</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(po.items || []).map((item: any, idx: number) => (
                                        <tr key={item.id || idx} className="hover:bg-slate-50">
                                            <td className="p-4 text-center text-slate-500">{idx + 1}</td>
                                            <td className="p-4 font-medium text-slate-800">
                                                {item.item_name}
                                                {item.product_id && (
                                                    <Badge variant="outline" className="ml-2 text-[10px] bg-slate-50 font-normal">
                                                        Master ID: {item.product_id}
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="p-4 text-center font-bold text-slate-700 bg-slate-50/30">{item.quantity}</td>
                                            <td className="p-4 text-right font-mono text-slate-600">{formatRp(item.unit_price)}</td>
                                            <td className="p-4 text-right font-mono font-bold text-slate-800">{formatRp(item.total_price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* REKAPITULASI BIAYA */}
                        <div className="flex flex-col items-end justify-center p-6 bg-slate-50 rounded-b-lg border-t gap-2">
                            <div className="flex justify-between w-64 text-sm font-medium text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-mono">{formatRp(po.subtotal)}</span>
                            </div>
                            <div className="flex justify-between w-64 text-sm font-medium text-slate-600">
                                <span>Pajak (Tax)</span>
                                <span className="font-mono text-rose-600">+ {formatRp(po.tax_amount)}</span>
                            </div>
                            <div className="w-64 h-px bg-slate-200 my-1"></div>
                            <div className="flex justify-between w-64 text-lg font-black text-slate-800">
                                <span>Grand Total</span>
                                <span className="font-mono">{formatRp(po.grand_total)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Clock, MapPin, Package, FileText, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
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

export default function GoodsReceiptShow({ goodsReceipt }: any) {
    // 1. Amankan data dari pembungkus "data" Laravel Resource
    const gr = goodsReceipt?.data || goodsReceipt;
    
    // State untuk mengontrol status loading saat request dikirim
    const [isProcessing, setIsProcessing] = useState(false);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // FUNGSI EKSEKUSI PENAMBAHAN STOK YANG DIPANGGIL OLEH ALERT DIALOG
    const handleReceive = () => {
        setIsProcessing(true);
        router.post(route('goods-receipts.receive', gr.id), {}, {
            preserveScroll: true,
            onFinish: () => setIsProcessing(false),
        });
    };

    return (
        <AppLayout>
            <Head title={`Detail GR - ${gr.gr_number}`} />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* HEADER NAVIGASI */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                            <ArrowLeft className="size-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Package className="size-6 text-emerald-600" /> {gr.gr_number}
                            </h1>
                            <p className="text-muted-foreground text-sm">Pemasok: <span className="font-semibold text-slate-800">{gr.supplier_name}</span></p>
                        </div>
                    </div>
                    <div>
                        {gr.status === 'received' ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent px-3 py-1 flex gap-1.5 items-center">
                                <CheckCircle2 className="size-4" /> Stok Sudah Bertambah
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 px-3 py-1 flex gap-1.5 items-center">
                                <Clock className="size-4" /> Menunggu Konfirmasi Fisik
                            </Badge>
                        )}
                    </div>
                </div>

                {/* BANNER KONFIRMASI GUDANG DENGAN SHADCN ALERT DIALOG */}
                {gr.status !== 'received' && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between shadow-sm gap-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="size-6 text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-bold text-emerald-900">Konfirmasi Barang Masuk (Inbound)</h4>
                                <p className="text-sm text-emerald-700 mt-1">
                                    Jika fisik barang sudah dihitung dan sesuai, klik konfirmasi agar sistem otomatis menambahkan stok master produk Anda.
                                </p>
                            </div>
                        </div>
                        
                        {/* IMPLEMENTASI SHADCN ALERT DIALOG */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto shrink-0 shadow-md h-12 px-6">
                                    <CheckCircle2 className="size-5 mr-2" /> Konfirmasi & Tambah Stok
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2 text-slate-800">
                                        <AlertTriangle className="size-5 text-amber-500" />
                                        Konfirmasi Penerimaan Barang
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-600">
                                        Apakah Anda yakin perhitungan fisik barang sudah benar? 
                                        Tindakan ini akan <strong>secara permanen menambahkan stok</strong> ke dalam sistem master produk dan tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-4">
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleReceive} className="bg-emerald-600 hover:bg-emerald-700">
                                        Ya, Tambahkan Stok
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* INFO PENERIMAAN */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg">Informasi Dokumen</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Tanggal Terima</p>
                                    <p className="font-medium text-slate-800">{formatDate(gr.receipt_date)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Penerima Gudang</p>
                                    <p className="font-medium text-slate-800">{gr.receiver_name || '-'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Ref. PO Induk</p>
                                {gr.purchase_order ? (
                                    <div className="flex items-center gap-1.5 font-mono text-blue-600 font-medium bg-blue-50 p-2 rounded w-max">
                                        <FileText className="size-4" /> {gr.purchase_order.po_number}
                                    </div>
                                ) : (
                                    <p className="text-slate-500">Manual (Tanpa Dokumen PO)</p>
                                )}
                            </div>
                            {gr.notes && (
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Catatan</p>
                                    <p className="text-sm bg-slate-50 p-3 rounded border text-slate-700">{gr.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* TABEL BARANG FISIK */}
                <Card className="shadow-sm border-t-4 border-t-slate-700">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="size-5 text-slate-700" /> Rincian Fisik Barang & Pemetaan Master
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 text-slate-600 font-medium border-y">
                                    <tr>
                                        <th className="p-3 w-12 text-center">No</th>
                                        <th className="p-3">Nama Barang dari Pemasok</th>
                                        <th className="p-3">Status Mapping Gudang</th>
                                        <th className="p-3 text-center w-32">Kuantitas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(gr.items?.data || gr.items || []).map((item: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="p-4 text-center text-slate-500">{idx + 1}</td>
                                            <td className="p-4 font-medium text-slate-800">{item.item_name}</td>
                                            <td className="p-4">
                                                {item.product_id ? (
                                                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        Di-mapping ke Master ID: {item.product_id}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-slate-400 border-slate-200">
                                                        Lewati (Non-Stok)
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="p-4 text-center font-bold text-lg text-slate-800 bg-slate-50/50">{item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
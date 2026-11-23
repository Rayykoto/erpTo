import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Truck, CheckCircle2, Clock, MapPin, Package, Printer, FileText } from 'lucide-react';

export default function DeliveryOrderShow({ deliveryOrder }: any) {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handleDeliver = () => {
        if (confirm('Konfirmasi bahwa barang telah diterima oleh klien dengan baik?')) {
            router.post(route('delivery-orders.deliver', deliveryOrder.id));
        }
    };

    return (
        <AppLayout>
            <Head title={`Surat Jalan - ${deliveryOrder.do_number}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* HEADER NAVIGASI */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                            <ArrowLeft className="size-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Truck className="size-6 text-primary" /> {deliveryOrder.do_number}
                            </h1>
                            <p className="text-muted-foreground text-sm">Tujuan: <span className="font-semibold text-slate-800">{deliveryOrder.client_name}</span></p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {deliveryOrder.status === 'delivered' ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent px-3 py-1 flex gap-1.5 items-center">
                                <CheckCircle2 className="size-4" /> Terkirim
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 px-3 py-1 flex gap-1.5 items-center">
                                <Clock className="size-4" /> Dalam Proses Pengiriman
                            </Badge>
                        )}
                        <Button variant="outline" asChild className="gap-2">
                            <a href={route('delivery-orders.print', deliveryOrder.id)} target="_blank" rel="noreferrer">
                                <Printer className="size-4" /> Cetak
                            </a>
                        </Button>
                    </div>
                </div>

                {/* BANNER KONFIRMASI (Bisa di-klik via HP oleh Supir) */}
                {deliveryOrder.status !== 'delivered' && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between shadow-sm gap-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="size-6 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-bold text-blue-900">Konfirmasi Bukti Terima (PoD)</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    Jika barang sudah sampai di lokasi klien dan ditandatangani, segera klik tombol konfirmasi untuk memperbarui status.
                                </p>
                            </div>
                        </div>
                        <Button onClick={handleDeliver} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto shrink-0 shadow-md h-12 px-6">
                            <CheckCircle2 className="size-5 mr-2" /> Konfirmasi Barang Sampai
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* INFO LOGISTIK */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg">Informasi Pengiriman</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Jadwal Kirim</p>
                                <p className="font-medium text-slate-800">{formatDate(deliveryOrder.delivery_date)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Nama Supir / Kurir</p>
                                    <p className="font-medium text-slate-800">{deliveryOrder.driver_name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Plat Kendaraan</p>
                                    <p className="font-medium font-mono text-slate-800">{deliveryOrder.vehicle_number || '-'}</p>
                                </div>
                            </div>
                            {deliveryOrder.delivered_at && (
                                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg mt-2">
                                    <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider mb-1">Tiba di Tujuan Pada</p>
                                    <p className="font-bold text-emerald-900">{formatDate(deliveryOrder.delivered_at)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* REFERENSI DOKUMEN & CATATAN */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg">Referensi Dokumen</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">No. Sales Order Induk</p>
                                {deliveryOrder.sales_order ? (
                                    <Link href={route('sales-orders.show', deliveryOrder.sales_order_id)} className="font-medium text-blue-600 hover:underline flex items-center gap-1.5">
                                        <FileText className="size-4" /> {deliveryOrder.sales_order.so_number}
                                    </Link>
                                ) : (
                                    <p className="text-slate-500">-</p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Sales Person</p>
                                <p className="font-medium text-slate-800">{deliveryOrder.sales_order?.sales_person?.name || '-'}</p>
                            </div>
                            {deliveryOrder.notes && (
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Catatan Logistik</p>
                                    <p className="text-sm bg-amber-50 p-3 rounded border border-amber-100 text-amber-900 whitespace-pre-wrap">{deliveryOrder.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* TABEL BARANG FISIK */}
                <Card className="shadow-sm border-t-4 border-t-slate-700">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="size-5 text-slate-700" /> Rincian Muatan Fisik
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 text-slate-600 font-medium border-y">
                                    <tr>
                                        <th className="p-3 w-12 text-center">No</th>
                                        <th className="p-3">Nama Produk / Barang</th>
                                        <th className="p-3 text-center w-32">Kuantitas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {deliveryOrder.items.map((item: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="p-4 text-center text-slate-500">{idx + 1}</td>
                                            <td className="p-4 font-medium text-slate-800">{item.item_name}</td>
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
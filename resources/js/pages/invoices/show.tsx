import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Receipt, CheckCircle2, AlertCircle, Banknote, Printer } from 'lucide-react';

export default function InvoiceShow({ invoice }: any) {
    const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const today = new Date().toISOString().split('T')[0];

    // Setup Form untuk mencatat uang masuk (Cicilan/Pelunasan)
    const { data, setData, post, processing, reset } = useForm({
        amount_paid: invoice.balance_due || 0,
        payment_date: today,
        payment_method: 'Transfer Bank',
        reference_number: ''
    });

    const handleRecordPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm(`Catat pembayaran sebesar ${formatRp(data.amount_paid)}?`)) {
            post(route('invoices.record-payment', invoice.id), {
                onSuccess: () => reset('reference_number')
            });
        }
    };

    return (
        <AppLayout>
            <Head title={`Faktur - ${invoice.invoice_number}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                            <ArrowLeft className="size-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Receipt className="size-6 text-primary" /> {invoice.invoice_number}
                            </h1>
                            <p className="text-muted-foreground text-sm">Klien: <span className="font-semibold text-slate-800">{invoice.client_name}</span></p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'partial' ? 'secondary' : 'destructive'} className="uppercase px-4 py-1.5 text-sm">
                            {invoice.status}
                        </Badge>
                        <Button variant="outline" asChild className="gap-2">
                            <a href={route('invoices.print', invoice.id)} target="_blank" rel="noreferrer">
                                <Printer className="size-4" /> Cetak
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* KOLOM KIRI: RINCIAN TAGIHAN */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle>Rincian Tagihan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6 p-4 bg-slate-50 rounded-lg border">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Tanggal Terbit</p>
                                        <p className="font-medium text-slate-800">{formatDate(invoice.issue_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Jatuh Tempo</p>
                                        <p className="font-medium text-red-600">{formatDate(invoice.due_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Sales Person</p>
                                        <p className="font-medium text-slate-800">{invoice.sales_person?.name || '-'}</p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-100 text-slate-600 font-medium border-b">
                                            <tr>
                                                <th className="p-3">Nama Produk / Jasa</th>
                                                <th className="p-3 text-center">Qty</th>
                                                <th className="p-3 text-right">Harga Satuan</th>
                                                <th className="p-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {invoice.items.map((item: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-slate-50">
                                                    <td className="p-3 font-medium text-slate-800">{item.item_name}</td>
                                                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                                                    <td className="p-3 text-right font-mono text-slate-600">{formatRp(item.unit_price)}</td>
                                                    <td className="p-3 text-right font-mono font-medium text-slate-800">{formatRp(item.total_price)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50 border-t-2">
                                            <tr>
                                                <td colSpan={3} className="p-3 text-right font-semibold text-slate-600">Subtotal</td>
                                                <td className="p-3 text-right font-mono font-medium">{formatRp(invoice.subtotal)}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan={3} className="p-3 text-right font-semibold text-slate-600">PPN (11%)</td>
                                                <td className="p-3 text-right font-mono font-medium">{formatRp(invoice.tax_amount)}</td>
                                            </tr>
                                            <tr className="bg-blue-50/50">
                                                <td colSpan={3} className="p-3 text-right font-bold text-blue-900 text-base">GRAND TOTAL</td>
                                                <td className="p-3 text-right font-mono font-bold text-blue-700 text-lg">{formatRp(invoice.grand_total)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* KOLOM KANAN: PENCATATAN CICILAN & STATUS */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        
                        {/* WIDGET SISA HUTANG */}
                        <Card className={`shadow-sm border-t-4 ${invoice.balance_due > 0 ? 'border-t-red-500' : 'border-t-emerald-500'}`}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Status Pembayaran</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {invoice.balance_due > 0 ? (
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
                                        <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-1">Sisa Tagihan (Belum Lunas)</p>
                                        <p className="text-3xl font-black font-mono text-red-700 tracking-tight">{formatRp(invoice.balance_due)}</p>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center flex flex-col items-center">
                                        <CheckCircle2 className="size-8 text-emerald-500 mb-2" />
                                        <p className="text-sm font-semibold text-emerald-700 uppercase tracking-widest">Lunas Sepenuhnya</p>
                                        <p className="text-lg font-bold font-mono text-emerald-800 tracking-tight">{formatRp(invoice.grand_total)}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* FORM INPUT UANG MASUK */}
                        {invoice.balance_due > 0 && (
                            <Card className="shadow-sm border border-blue-100">
                                <CardHeader className="pb-3 bg-blue-50/30">
                                    <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                                        <Banknote className="size-4" /> Catat Uang Masuk
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <form onSubmit={handleRecordPayment} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label>Nominal Pembayaran (Rp)</Label>
                                            <Input 
                                                type="number" 
                                                max={invoice.balance_due} 
                                                value={data.amount_paid} 
                                                onChange={e => setData('amount_paid', parseFloat(e.target.value) || 0)} 
                                                required 
                                                className="font-mono text-lg font-semibold text-blue-700 border-blue-200"
                                            />
                                            <p className="text-[10px] text-muted-foreground">*Maksimal sebesar sisa tagihan</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Tanggal Pembayaran</Label>
                                            <Input type="date" value={data.payment_date} onChange={e => setData('payment_date', e.target.value)} required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Metode / Rekening</Label>
                                            <Input placeholder="Contoh: Transfer BCA" value={data.payment_method} onChange={e => setData('payment_method', e.target.value)} required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>No. Referensi (Opsional)</Label>
                                            <Input placeholder="Mutasi / No. Bukti" value={data.reference_number} onChange={e => setData('reference_number', e.target.value)} />
                                        </div>
                                        <Button type="submit" disabled={processing || data.amount_paid <= 0} className="w-full bg-blue-600 hover:bg-blue-700">
                                            Simpan Pembayaran
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* RIWAYAT CICILAN (PAYMENT RECEIPTS) */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Riwayat Pembayaran</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {invoice.payment_receipts && invoice.payment_receipts.length > 0 ? (
                                    <div className="space-y-3 border-l-2 border-slate-200 pl-4 ml-2">
                                        {invoice.payment_receipts.map((receipt: any) => (
                                            <div key={receipt.id} className="relative">
                                                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-slate-300 border-2 border-white"></div>
                                                <p className="text-xs font-semibold text-slate-500 mb-0.5">{formatDate(receipt.payment_date)}</p>
                                                <div className="bg-white border p-3 rounded-lg shadow-sm">
                                                    <p className="font-bold text-emerald-600 font-mono text-lg">{formatRp(receipt.amount_paid)}</p>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <p className="text-xs font-medium text-slate-700">{receipt.payment_method}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">{receipt.receipt_number}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-dashed rounded-lg text-slate-400">
                                        <AlertCircle className="size-6 mb-2 opacity-50" />
                                        <p className="text-sm italic">Belum ada pembayaran dicatat.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
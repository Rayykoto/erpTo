import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, FileText, Save, Link as LinkIcon, Info } from 'lucide-react';

export default function InvoiceCreate({ invoiceNumber, salesReps, sourceData }: any) {
    const today = new Date().toISOString().split('T')[0];

    // ========================================================================
    // Pre-fill data otomatis jika sourceData ada (Dari SO)
    // ========================================================================
    const { data, setData, post, processing } = useForm({
        invoice_number: invoiceNumber,
        client_name: sourceData?.client_name || '',
        sales_user_id: sourceData?.sales_user_id || '',
        sales_order_id: sourceData?.sales_order_id || null,
        delivery_order_id: sourceData?.delivery_order_id || null,
        issue_date: today,
        due_date: '',
        apply_tax: true,
        notes: '',
        items: sourceData?.items && sourceData.items.length > 0 
                ? sourceData.items 
                : [{ item_name: '', quantity: 1, unit_price: 0 }]
    });

    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

    // Kalkulasi Otomatis (Real-time)
    useEffect(() => {
        const newSubtotal = data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);
        const newTax = data.apply_tax ? newSubtotal * 0.11 : 0; 
        
        setSubtotal(newSubtotal);
        setTax(newTax);
        setGrandTotal(newSubtotal + newTax);
    }, [data.items, data.apply_tax]);

    const addItem = () => setData('items', [...data.items, { item_name: '', quantity: 1, unit_price: 0 }]);
    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };
    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items] as any;
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('invoices.store'));
    };

    return (
        <AppLayout>
            <Head title="Buat Faktur Penjualan" />
            
            <form onSubmit={submit} className="flex flex-col gap-6 p-6">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <FileText className="size-8 text-primary" /> Buat Faktur
                        </h1>
                        <p className="text-muted-foreground mt-1">Buat tagihan profesional dan hubungkan langsung dengan pencapaian Sales Anda.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Batal</Button>
                        <Button type="submit" disabled={processing} className="bg-primary flex gap-2 shadow-md">
                            <Save className="size-4" /> {processing ? 'Menyimpan...' : 'Simpan Faktur'}
                        </Button>
                    </div>
                </div>

                {/* BANNER INTEGRASI (Muncul hanya jika ditarik dari Sales Order) */}
                {data.sales_order_id && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
                        <Info className="size-5 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="font-semibold flex items-center gap-1.5">
                                <LinkIcon className="size-4" /> Mode Konversi Otomatis Aktif
                            </h4>
                            <p className="text-sm mt-1 opacity-90">
                                Form ini telah diisi secara otomatis berdasarkan dokumen <b>Sales Order</b> klien. 
                                Anda hanya perlu memverifikasi data dan menentukan tanggal jatuh tempo sebelum menyimpannya.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* INFO UTAMA */}
                    <Card className="lg:col-span-2 shadow-sm border-t-4 border-t-slate-600">
                        <CardHeader>
                            <CardTitle>Informasi Pelanggan & Penjualan</CardTitle>
                        </CardHeader>
                        <CardContent className="">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Pelanggan (Klien)</Label>
                                    <Input placeholder="Contoh: PT ABC Makmur" value={data.client_name} onChange={e => setData('client_name', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Sales Penanggung Jawab</Label>
                                    <select 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={data.sales_user_id} 
                                        onChange={e => setData('sales_user_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Sales --</option>
                                        {salesReps.map((rep: any) => (
                                            <option key={rep.id} value={rep.id}>{rep.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Tanggal Terbit</Label>
                                    <Input type="date" value={data.issue_date} onChange={e => setData('issue_date', e.target.value)} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Jatuh Tempo Pembayaran <span className="text-red-500">*</span></Label>
                                    <Input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} required className="border-orange-300 focus-visible:ring-orange-500" />
                                </div>
                                <div className="space-y-2">
                                <Label>Notes</Label>
                                    <Input placeholder="Opsional Tambahan Catatan" value={data.notes} onChange={e => setData('notes', e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* NOMOR INVOICE */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Nomor Faktur</CardTitle>
                            <CardDescription>Otomatis dihasilkan sistem</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-50 p-6 rounded-lg flex flex-col items-center justify-center border border-dashed border-slate-300">
                                <span className="text-sm text-muted-foreground mb-1">No. Dokumen:</span>
                                <span className="text-2xl font-bold font-mono tracking-wider text-slate-800">{data.invoice_number}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* BARIS BARANG (LINE ITEMS) */}
                    <Card className="lg:col-span-3 shadow-sm border-t-4 border-t-primary">
                        <CardHeader>
                            <CardTitle>Rincian Barang / Jasa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 text-slate-600 font-medium">
                                        <tr>
                                            <th className="p-3 w-1/2">Nama Produk / Deskripsi</th>
                                            <th className="p-3 w-32">Kuantitas</th>
                                            <th className="p-3 w-48">Harga Satuan (Rp)</th>
                                            <th className="p-3 text-right">Total (Rp)</th>
                                            <th className="p-3 w-16 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.items.map((item: any, index: number) => (
                                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-2">
                                                    <Input placeholder="Deskripsi barang..." value={item.item_name} onChange={e => updateItem(index, 'item_name', e.target.value)} required className="border-transparent hover:border-input focus:border-input bg-transparent" />
                                                </td>
                                                <td className="p-2">
                                                    <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)} required className="border-transparent hover:border-input focus:border-input bg-transparent text-center" />
                                                </td>
                                                <td className="p-2">
                                                    <Input type="number" min="0" value={item.unit_price} onChange={e => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)} required className="border-transparent hover:border-input focus:border-input bg-transparent font-mono" />
                                                </td>
                                                <td className="p-2 text-right font-mono font-medium align-middle pr-4 text-slate-700">
                                                    {formatRp(item.quantity * item.unit_price)}
                                                </td>
                                                <td className="p-2 text-center align-middle">
                                                    <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeItem(index)} disabled={data.items.length === 1}>
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <Button type="button" variant="outline" size="sm" className="mt-4 border-dashed text-slate-600" onClick={addItem}>
                                <Plus className="size-4 mr-2" /> Tambah Baris Kosong
                            </Button>

                            <hr className="my-6" />

                            {/* RINGKASAN TOTAL (Desain Profesional) */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                <div className="flex items-center space-x-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                    <Checkbox id="tax" checked={data.apply_tax} onCheckedChange={(checked) => setData('apply_tax', checked as boolean)} className="data-[state=checked]:bg-blue-600" />
                                    <label htmlFor="tax" className="text-sm font-semibold leading-none text-blue-900 cursor-pointer">
                                        Kenakan Pajak PPN (11%) ke Tagihan Ini
                                    </label>
                                </div>
                                
                                <div className="w-full md:w-96 space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-inner">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Subtotal (Dasar Pengenaan Pajak):</span>
                                        <span className="font-mono text-slate-700">{formatRp(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">PPN (11%):</span>
                                        <span className="font-mono text-slate-700">{formatRp(tax)}</span>
                                    </div>
                                    <div className="border-t border-slate-300 my-2 border-dashed"></div>
                                    <div className="flex justify-between items-center text-lg font-black text-primary">
                                        <span>TOTAL TAGIHAN:</span>
                                        <span className="font-mono tracking-tight">{formatRp(grandTotal)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </AppLayout>
    );
}
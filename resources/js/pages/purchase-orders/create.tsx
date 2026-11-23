import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Store, Save, AlertCircle } from 'lucide-react';

export default function PurchaseOrderCreate({ poNumber }: any) {
    const today = new Date().toISOString().split('T')[0];

    // TAMBAHAN KUNCI: Tarik objek 'errors' dari useForm
    const { data, setData, post, processing, errors } = useForm({
        po_number: poNumber,
        supplier_name: '',
        order_date: today,
        apply_tax: true,
        items: [
            { item_name: '', quantity: 1, unit_price: 0 }
        ]
    });

    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

    useEffect(() => {
        const newSubtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
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
        post(route('purchase-orders.store'), {
            onError: (err) => console.log("Gagal Validasi Backend:", err) // Tampilkan error di console browser
        });
    };

    return (
        <AppLayout>
            <Head title="Buat Purchase Order (PO)" />
            
            <form onSubmit={submit} className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-slate-800">
                            <Store className="size-8 text-primary" /> Buat Purchase Order (PO)
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">Pesan persediaan barang atau stok baru kepada Pemasok/Supplier.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Batal</Button>
                        <Button type="submit" disabled={processing} className="bg-primary flex gap-2">
                            <Save className="size-4" /> Simpan Dokumen PO
                        </Button>
                    </div>
                </div>

                {/* TAMPILKAN BANNER ERROR JIKA ADA MASALAH VALIDASI UMUM */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3 border border-red-200">
                        <AlertCircle className="size-5 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="font-bold">Gagal Menyimpan PO</h4>
                            <p className="text-sm">Silakan periksa kembali isian form Anda, ada beberapa data yang tidak valid atau kosong.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* INFO VENDOR */}
                    <Card className="lg:col-span-2 shadow-sm border-t-4 border-t-primary">
                        <CardHeader>
                            <CardTitle className="text-lg">Informasi Pemasok (Supplier)</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label className={errors.supplier_name ? 'text-red-500' : ''}>Nama Supplier / Vendor</Label>
                                <Input 
                                    placeholder="Contoh: PT Sumber Material Makmur" 
                                    value={data.supplier_name} 
                                    onChange={e => setData('supplier_name', e.target.value)} 
                                    className={errors.supplier_name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                />
                                {errors.supplier_name && <p className="text-xs text-red-500">{errors.supplier_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className={errors.order_date ? 'text-red-500' : ''}>Tanggal Pesanan</Label>
                                <Input 
                                    type="date" 
                                    value={data.order_date} 
                                    onChange={e => setData('order_date', e.target.value)} 
                                    className={errors.order_date ? 'border-red-500' : ''}
                                />
                                {errors.order_date && <p className="text-xs text-red-500">{errors.order_date}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* NOMOR PO */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Nomor Referensi PO</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`p-6 rounded-lg flex flex-col items-center justify-center border border-dashed ${errors.po_number ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-300'}`}>
                                <span className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">No. Dokumen:</span>
                                <span className={`text-2xl font-bold font-mono tracking-wider ${errors.po_number ? 'text-red-600' : 'text-slate-800'}`}>
                                    {data.po_number}
                                </span>
                            </div>
                            {errors.po_number && <p className="text-xs text-red-500 text-center mt-2">{errors.po_number}</p>}
                        </CardContent>
                    </Card>

                    {/* BARIS BARANG (MURNI TEKS) */}
                    <Card className="lg:col-span-3 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Daftar Barang yang Dipesan</CardTitle>
                            {errors.items && <p className="text-xs text-red-500">{errors.items}</p>}
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                                        <tr>
                                            <th className="p-3">Nama Barang / Deskripsi dari Pemasok</th>
                                            <th className="p-3 w-32">Kuantitas</th>
                                            <th className="p-3 w-48">Harga Beli Satuan (Rp)</th>
                                            <th className="p-3 text-right">Total (Rp)</th>
                                            <th className="p-3 w-16 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y bg-white">
                                        {data.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50/50">
                                                <td className="p-2">
                                                    <Input 
                                                        placeholder="Ketik nama barang..." 
                                                        value={item.item_name} 
                                                        onChange={e => updateItem(index, 'item_name', e.target.value)} 
                                                        className={errors[`items.${index}.item_name`] ? 'border-red-500' : ''}
                                                    />
                                                    {errors[`items.${index}.item_name`] && <span className="text-[10px] text-red-500">{errors[`items.${index}.item_name`]}</span>}
                                                </td>
                                                <td className="p-2">
                                                    <Input 
                                                        type="number" 
                                                        min="1" 
                                                        value={item.quantity} 
                                                        onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)} 
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input 
                                                        type="number" 
                                                        min="0" 
                                                        value={item.unit_price} 
                                                        onChange={e => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)} 
                                                    />
                                                </td>
                                                <td className="p-2 text-right font-mono font-medium align-middle pr-4 text-slate-700">
                                                    {formatRp(item.quantity * item.unit_price)}
                                                </td>
                                                <td className="p-2 text-center align-middle">
                                                    <Button type="button" variant="ghost" size="icon" className="text-rose-500 hover:bg-rose-50" onClick={() => removeItem(index)} disabled={data.items.length === 1}>
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <Button type="button" variant="outline" size="sm" className="mt-4 border-dashed gap-2" onClick={addItem}>
                                <Plus className="size-4" /> Tambah Baris Barang
                            </Button>

                            <hr className="my-6 border-slate-200" />

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                <div className="flex items-center space-x-2 bg-blue-50 p-3.5 rounded-lg border border-blue-100">
                                    <Checkbox id="tax" checked={data.apply_tax} onCheckedChange={(checked) => setData('apply_tax', checked as boolean)} />
                                    <label htmlFor="tax" className="text-sm font-medium leading-none text-blue-950 cursor-pointer">
                                        Pemasok menerapkan PPN (11%)
                                    </label>
                                </div>
                                
                                <div className="w-full md:w-80 space-y-3 bg-slate-50 p-4 rounded-xl border">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal PO:</span>
                                        <span className="font-mono">{formatRp(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">PPN (11%):</span>
                                        <span className="font-mono">{formatRp(tax)}</span>
                                    </div>
                                    <hr className="border-slate-200" />
                                    <div className="flex justify-between items-center text-lg font-bold text-primary">
                                        <span>Grand Total PO:</span>
                                        <span className="font-mono">{formatRp(grandTotal)}</span>
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
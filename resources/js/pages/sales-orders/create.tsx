import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ShoppingCart, Save } from 'lucide-react';

export default function SalesOrderCreate({ soNumber, salesReps, products = [] }: any) {
    const today = new Date().toISOString().split('T')[0];

    const productList = products?.data || products || [];
    const salesRepList = salesReps?.data || salesReps || [];

    // 1. AMBIL DARI LOCALSTORAGE JIKA ADA (MENCEGAH DATA HILANG SAAT REFRESH/ERROR)
    const savedDraft = typeof window !== 'undefined' ? localStorage.getItem('so_draft_form') : null;
    const parsedDraft = savedDraft ? JSON.parse(savedDraft) : null;

    const { data, setData, post, processing, errors } = useForm({
        // Jika ada draft tersimpan, gunakan data lama. Jika tidak, pakai soNumber baru dari server.
        so_number: parsedDraft ? parsedDraft.so_number : soNumber,
        client_name: parsedDraft ? parsedDraft.client_name : '',
        sales_user_id: parsedDraft ? parsedDraft.sales_user_id : '',
        order_date: parsedDraft ? parsedDraft.order_date : today,
        apply_tax: parsedDraft ? parsedDraft.apply_tax : true,
        items: parsedDraft ? parsedDraft.items : [
            { product_id: '', item_name: '', quantity: 1, unit_price: 0 }
        ]
    });

    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

    // 2. OTOMATIS SIMPAN KE LOCALSTORAGE SETIAP KALI USER MENGETIK SESUATU
    useEffect(() => {
        localStorage.setItem('so_draft_form', JSON.stringify(data));
    }, [data]);

    useEffect(() => {
        const newSubtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        const newTax = data.apply_tax ? newSubtotal * 0.11 : 0;
        
        setSubtotal(newSubtotal);
        setTax(newTax);
        setGrandTotal(newSubtotal + newTax);
    }, [data.items, data.apply_tax]);

    const addItem = () => setData('items', [...data.items, { product_id: '', item_name: '', quantity: 1, unit_price: 0 }]);
    
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

    const handleProductSelect = (index: number, productId: string) => {
        const selectedProduct = productList.find((p: any) => p.id.toString() === productId);
        const newItems = [...data.items] as any;

        if (selectedProduct) {
            newItems[index].product_id = selectedProduct.id;
            newItems[index].item_name = selectedProduct.name;
            newItems[index].unit_price = selectedProduct.price;
        } else {
            newItems[index].product_id = '';
            newItems[index].item_name = '';
            newItems[index].unit_price = 0;
        }
        setData('items', newItems);
    };

    const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('sales-orders.store'), {
            onSuccess: () => {
                localStorage.removeItem('so_draft_form');
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Buat Sales Order" />
            
            <form onSubmit={submit} className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-slate-800">
                            <ShoppingCart className="size-8 text-primary" /> Buat Sales Order (SO)
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">Catat pesanan klien yang terintegrasi langsung dengan pemotongan stok gudang.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Batal</Button>
                        <Button type="submit" disabled={processing} className="bg-primary flex gap-2">
                            <Save className="size-4" /> Simpan Pesanan
                        </Button>
                    </div>
                </div>

                {/* ALERT ERROR: DATA AMAN, CUKUP KLIK PERBARUI NOMOR SO SAJA */}
                {errors.error && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-amber-600 font-bold">⚠️ Perhatian:</span>
                            <p className="text-sm text-amber-800 font-medium">{errors.error}</p>
                        </div>
                        <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100 whitespace-nowrap"
                            onClick={() => {
                                // Ambil nomor SO terbaru dari server, dan update HANYA so_number di form
                                router.reload({
                                    only: ['soNumber'],
                                    onSuccess: (page: any) => {
                                        setData('so_number', page.props.soNumber);
                                    }
                                });
                            }}
                        >
                            Perbarui No. SO Saja & Coba Lagi
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* INFO UTAMA */}
                    <Card className="lg:col-span-2 shadow-sm border-t-4 border-t-primary">
                        <CardHeader>
                            <CardTitle className="text-lg">Informasi Pesanan & Klien</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Pelanggan (Klien)</Label>
                                <Input placeholder="Contoh: PT ABC Makmur" value={data.client_name} onChange={e => setData('client_name', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Sales Penanggung Jawab</Label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={data.sales_user_id} 
                                    onChange={e => setData('sales_user_id', e.target.value)}
                                    required
                                >
                                    <option value="">Pilih Nama Sales...</option>
                                    {salesRepList.map((rep: any) => (
                                        <option key={rep.id} value={rep.id}>{rep.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Tanggal Pesanan Sepakat</Label>
                                <Input type="date" value={data.order_date} onChange={e => setData('order_date', e.target.value)} required />
                            </div>
                        </CardContent>
                    </Card>

                    {/* NOMOR SO */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Nomor Sales Order</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-blue-50 p-6 rounded-lg flex flex-col items-center justify-center border border-dashed border-blue-200">
                                <span className="text-xs font-medium text-blue-600 mb-1 uppercase tracking-wider">No. Ref Dokumen:</span>
                                <span className="text-2xl font-bold font-mono tracking-wider text-blue-900">{data.so_number}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* BARIS BARANG (LINE ITEMS) */}
                    <Card className="lg:col-span-3 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Rincian Barang & Jasa</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">Pilih dari Master Produk untuk otomatis memotong stok gudang saat dikirim, atau ketik bebas untuk barang non-gudang/jasa.</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                                        <tr>
                                            <th className="p-3 w-1/3">Sumber Master Produk (Opsional)</th>
                                            <th className="p-3 w-1/3">Nama Barang / Deskripsi Jasa</th>
                                            <th className="p-3 w-28">Kuantitas</th>
                                            <th className="p-3 w-40">Harga Satuan (Rp)</th>
                                            <th className="p-3 text-right">Total (Rp)</th>
                                            <th className="p-3 w-16 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y bg-white">
                                        {data.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50/50">
                                                <td className="p-2">
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                        value={item.product_id}
                                                        onChange={e => handleProductSelect(index, e.target.value)}
                                                    >
                                                        <option value="">-- Ketik Manual / Non-Gudang --</option>
                                                        {productList.map((p: any) => (
                                                            <option key={p.id} value={p.id}>
                                                                [{p.sku}] {p.name} (Stok: {p.stock})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2">
                                                    <Input 
                                                        placeholder="Nama barang / jasa..." 
                                                        value={item.item_name} 
                                                        onChange={e => updateItem(index, 'item_name', e.target.value)} 
                                                        required 
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input 
                                                        type="number" 
                                                        min="1" 
                                                        value={item.quantity} 
                                                        onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)} 
                                                        required 
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input 
                                                        type="number" 
                                                        min="0" 
                                                        value={item.unit_price} 
                                                        onChange={e => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)} 
                                                        required 
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
                                <Plus className="size-4" /> Tambah Baris Item
                            </Button>

                            <hr className="my-6 border-slate-200" />

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                <div className="flex items-center space-x-2 bg-blue-50 p-3.5 rounded-lg border border-blue-100">
                                    <Checkbox id="tax" checked={data.apply_tax} onCheckedChange={(checked) => setData('apply_tax', checked as boolean)} />
                                    <label htmlFor="tax" className="text-sm font-medium leading-none text-blue-950 cursor-pointer">
                                        Terapkan PPN (11%) pada pesanan ini
                                    </label>
                                </div>
                                
                                <div className="w-full md:w-80 space-y-3 bg-slate-50 p-4 rounded-xl border">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal SO:</span>
                                        <span className="font-mono">{formatRp(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Estimasi PPN (11%):</span>
                                        <span className="font-mono">{formatRp(tax)}</span>
                                    </div>
                                    <hr className="border-slate-200" />
                                    <div className="flex justify-between items-center text-lg font-bold text-primary">
                                        <span>Total Nilai SO:</span>
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
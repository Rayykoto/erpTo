import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PackageCheck, Save, Trash2, Plus, AlertCircle } from 'lucide-react';

export default function GoodsReceiptCreate({ grNumber, sourceData, products = [] }: any) {
    const today = new Date().toISOString().split('T')[0];

    // Jika form dibuka dari PO, otomatis isi datanya. Jika tidak, mulai kosong.
    const { data, setData, post, processing, errors } = useForm({
        gr_number: grNumber || '',
        purchase_order_id: sourceData?.purchase_order_id || '',
        supplier_name: sourceData?.supplier_name || '',
        receipt_date: today,
        receiver_name: '', // Nama staf gudang
        notes: '',
        items: sourceData?.items || [
            { product_id: '', item_name: '', quantity: 1 }
        ]
    });

    const addItem = () => setData('items', [...data.items, { product_id: '', item_name: '', quantity: 1 }]);
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

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('goods-receipts.store'));
    };

    return (
        <AppLayout>
            <Head title="Buat Bukti Terima (GR)" />
            
            <form onSubmit={submit} className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-slate-800">
                            <PackageCheck className="size-8 text-emerald-600" /> Bukti Terima Barang (GR)
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">Catat penerimaan barang dari Pemasok dan pasangkan dengan Master Produk gudang.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Batal</Button>
                        <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white flex gap-2">
                            <Save className="size-4" /> Simpan Dokumen GR
                        </Button>
                    </div>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3 border border-red-200">
                        <AlertCircle className="size-5 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="font-bold">Gagal Menyimpan Data</h4>
                            <p className="text-sm">Silakan periksa kembali form, ada beberapa data yang kosong atau tidak valid.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* INFO PENERIMAAN */}
                    <Card className="lg:col-span-2 shadow-sm border-t-4 border-t-emerald-500">
                        <CardHeader>
                            <CardTitle className="text-lg">Informasi Pengiriman Pemasok</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nama Supplier / Pemasok</Label>
                                <Input value={data.supplier_name} onChange={e => setData('supplier_name', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Tanggal Barang Diterima</Label>
                                <Input type="date" value={data.receipt_date} onChange={e => setData('receipt_date', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Nama Staf Penerima (Gudang)</Label>
                                <Input placeholder="Contoh: Budi Santoso" value={data.receiver_name} onChange={e => setData('receiver_name', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Catatan Penerimaan</Label>
                                <Input placeholder="Opsional (Misal: Kardus sedikit penyok)" value={data.notes} onChange={e => setData('notes', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* NOMOR REFERENSI */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Nomor Referensi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>No. Bukti Terima (Otomatis)</Label>
                                <Input value={data.gr_number} readOnly className="bg-slate-50 font-mono font-bold" />
                            </div>
                            {data.purchase_order_id && (
                                <div className="space-y-2 p-3 bg-blue-50 border border-blue-100 rounded-md">
                                    <Label className="text-blue-800">No. PO Induk (Ref)</Label>
                                    <Input value={`Terkait dengan PO ID #${data.purchase_order_id}`} readOnly className="bg-transparent border-none shadow-none font-mono text-sm px-0" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* BARIS BARANG (MAPPING) */}
                    <Card className="lg:col-span-3 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Pencocokan Barang Fisik</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">Pilih master produk di sebelah kiri agar stok di aplikasi bertambah. Jika barang bukan untuk dijual/restock, biarkan kosong.</p>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                                        <tr>
                                            <th className="p-3 w-1/3 text-emerald-700 bg-emerald-50">Map ke Master Produk (+)</th>
                                            <th className="p-3">Nama Barang dari Surat Jalan Pemasok</th>
                                            <th className="p-3 w-32">Qty Diterima</th>
                                            <th className="p-3 w-16 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y bg-white">
                                        {data.items.map((item: any, index: number) => (
                                            <tr key={index} className="hover:bg-slate-50">
                                                <td className="p-2 border-r bg-emerald-50/30">
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-xs focus:ring-emerald-500"
                                                        value={item.product_id || ''}
                                                        onChange={e => updateItem(index, 'product_id', e.target.value)}
                                                    >
                                                        <option value="">-- Lewati (Jangan tambah stok) --</option>
                                                        {(products?.data || products || []).map((p: any) => (
                                                            <option key={p.id} value={p.id}>[{p.sku}] {p.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2">
                                                    <Input placeholder="Nama barang di kotak..." value={item.item_name} onChange={e => updateItem(index, 'item_name', e.target.value)} required />
                                                </td>
                                                <td className="p-2">
                                                    <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)} required />
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
                                <Plus className="size-4" /> Tambah Barang Fisik
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </AppLayout>
    );
}
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Truck, Save, Link as LinkIcon, Info } from 'lucide-react';

export default function DeliveryOrderCreate({ doNumber, sourceData }: any) {
    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing } = useForm({
        do_number: doNumber,
        client_name: sourceData?.client_name || '',
        sales_order_id: sourceData?.sales_order_id || null,
        delivery_date: today,
        driver_name: '',
        vehicle_number: '',
        notes: '',
        items: sourceData?.items && sourceData.items.length > 0 
                ? sourceData.items 
                : [{ item_name: '', quantity: 1 }]
    });

    const addItem = () => setData('items', [...data.items, { item_name: '', quantity: 1 }]);
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
        post(route('delivery-orders.store'));
    };

    return (
        <AppLayout>
            <Head title="Buat Surat Jalan (DO)" />
            
            <form onSubmit={submit} className="flex flex-col gap-6 p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Truck className="size-8 text-primary" /> Buat Surat Jalan (DO)
                        </h1>
                        <p className="text-muted-foreground mt-1">Dokumen pengiriman fisik tanpa mencantumkan nilai finansial (Harga).</p>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Batal</Button>
                        <Button type="submit" disabled={processing} className="bg-primary flex gap-2">
                            <Save className="size-4" /> Simpan Surat Jalan
                        </Button>
                    </div>
                </div>

                {data.sales_order_id && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                        <Info className="size-5 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="font-semibold flex items-center gap-1.5">
                                <LinkIcon className="size-4" /> Data ditarik dari Sales Order
                            </h4>
                            <p className="text-sm mt-1 opacity-90">
                                Hanya Kuantitas fisik yang ditarik ke form ini. Harga modal/jual sengaja disembunyikan agar aman dipegang oleh supir ekspedisi atau tim lapangan.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* INFO PENGIRIMAN */}
                    <Card className="shadow-sm border-t-4 border-t-slate-600">
                        <CardHeader>
                            <CardTitle>Info Penerima & Logistik</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Pelanggan (Penerima)</Label>
                                <Input value={data.client_name} onChange={e => setData('client_name', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Tanggal Pengiriman</Label>
                                <Input type="date" value={data.delivery_date} onChange={e => setData('delivery_date', e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nama Supir / Kurir</Label>
                                    <Input placeholder="Cth: Budi" value={data.driver_name} onChange={e => setData('driver_name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Plat Nomor / Resi</Label>
                                    <Input placeholder="Cth: B 1234 CD" value={data.vehicle_number} onChange={e => setData('vehicle_number', e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* DOKUMEN & CATATAN */}
                    <div className="flex flex-col gap-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>Nomor Surat Jalan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center border border-dashed border-slate-300">
                                    <span className="text-2xl font-bold font-mono tracking-wider text-slate-800">{data.do_number}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm flex-1">
                            <CardHeader>
                                <CardTitle>Catatan Pengiriman</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea 
                                    placeholder="Cth: Hati-hati barang pecah belah. Titip di pos satpam jika tidak ada orang." 
                                    value={data.notes} 
                                    onChange={e => setData('notes', e.target.value)}
                                    className="resize-none h-full min-h-[100px]"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* BARIS BARANG FISIK SAJA */}
                <Card className="shadow-sm border-t-4 border-t-emerald-500">
                    <CardHeader>
                        <CardTitle>Barang Fisik yang Diangkut</CardTitle>
                        <CardDescription>Sesuaikan jumlah jika pengiriman dilakukan secara bertahap (sebagian).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 text-slate-600 font-medium">
                                    <tr>
                                        <th className="p-3 w-2/3">Nama Produk / Jasa</th>
                                        <th className="p-3 w-1/3 text-center">Kuantitas Fisik</th>
                                        <th className="p-3 w-16 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.items.map((item: any, index: number) => (
                                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-2">
                                                <Input placeholder="Deskripsi fisik barang..." value={item.item_name} onChange={e => updateItem(index, 'item_name', e.target.value)} required className="border-transparent hover:border-input focus:border-input bg-transparent" />
                                            </td>
                                            <td className="p-2">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)} required className="border-transparent hover:border-input focus:border-input bg-transparent text-center w-24 font-bold text-lg" />
                                                    <span className="text-muted-foreground text-xs font-semibold">Unit</span>
                                                </div>
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
                            <Plus className="size-4 mr-2" /> Tambah Baris Ekstra
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </AppLayout>
    );
}
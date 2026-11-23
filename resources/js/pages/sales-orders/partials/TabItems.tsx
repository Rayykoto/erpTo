import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TabItems({ so }: { so: any }) {
    const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

    return (
        <Card className="shadow-sm border-t-4 border-t-slate-700">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">Daftar Barang Dipesan</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 font-medium border-b">
                            <tr>
                                <th className="p-3 w-12 text-center">No</th>
                                <th className="p-3">Nama Produk / Barang Fisik</th>
                                <th className="p-3 text-center">Qty</th>
                                <th className="p-3 text-right">Harga Satuan</th>
                                <th className="p-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(so.items || []).map((item: any, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                    <td className="p-3 text-center text-slate-500">{idx + 1}</td>
                                    <td className="p-3 font-medium text-slate-800">
                                        {item.item_name}
                                        {item.product_id && (
                                            <Badge variant="outline" className="ml-2 text-[10px] bg-slate-50 font-normal">
                                                Master ID: {item.product_id}
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                                    <td className="p-3 text-right font-mono text-slate-600">{formatRp(item.unit_price)}</td>
                                    <td className="p-3 text-right font-mono font-medium text-slate-800">{formatRp(item.total_price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
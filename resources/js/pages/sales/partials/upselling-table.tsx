import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export default function UpSellingTable({ upSellingProducts }: { upSellingProducts: any[] }) {
    return (
        <Card className="lg:col-span-2 shadow-sm border-t-4 border-t-purple-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ArrowUpRight className="size-5 text-purple-500" /> Taktik Up-Selling & Bonus Poin
                </CardTitle>
                <CardDescription>Tawarkan produk pendamping ini ke klien untuk mempercepat pengumpulan poin.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                            <tr>
                                <th className="p-3">Produk Awal (Dibeli Klien)</th>
                                <th className="p-3">Arahkan Up-Sell Ke</th>
                                <th className="p-3 text-center">Bonus Poin</th>
                                <th className="p-3 text-right">Tingkat Keberhasilan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {(upSellingProducts || []).map((item: any) => (
                                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="p-3 font-medium">{item.name}</td>
                                    <td className="p-3 font-semibold flex items-center gap-1">
                                        <ArrowUpRight className="size-3 text-muted-foreground" /> {item.upsell_to}
                                    </td>
                                    <td className="p-3 text-center">
                                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">
                                            <Sparkles className="size-3 mr-1" /> {item.point_bonus}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-right text-muted-foreground">
                                        {item.success_rate}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
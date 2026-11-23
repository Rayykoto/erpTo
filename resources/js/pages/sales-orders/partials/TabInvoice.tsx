import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePermission } from '@/hooks/usePermission';

export default function TabInvoice({ so }: { so: any }) {
    const { hasPermission } = usePermission();
    const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

    return (
        <Card className="shadow-sm border-t-4 border-t-blue-500">
            <CardHeader className="pb-3 flex flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2">Faktur Penagihan</CardTitle>
                    <CardDescription>Riwayat penagihan dan pembayaran</CardDescription>
                </div>
                {hasPermission('sales_orders.execute') && (
                    <Button size="sm" variant="outline" asChild className="shrink-0">
                        <Link href={route('sales-orders.convert-invoice', so.id)}>+ Buat Faktur Baru</Link>
                    </Button>
                )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {so.invoices && so.invoices.length > 0 ? (
                    so.invoices.map((inv: any) => (
                        <div key={inv.id} className="p-4 border rounded-xl hover:shadow-md transition-all bg-white flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-slate-800 text-lg">{inv.invoice_number}</p>
                                    <p className="font-mono font-bold text-blue-600 mt-1 text-base">{formatRp(inv.grand_total)}</p>
                                </div>
                                <Badge variant={inv.status === 'paid' ? 'default' : inv.status === 'partial' ? 'secondary' : 'destructive'} className="uppercase px-3 py-1">
                                    {inv.status}
                                </Badge>
                            </div>
                            {inv.status !== 'paid' && (
                                <div className="bg-red-50 text-red-700 text-sm p-2 rounded-md font-medium flex justify-between items-center border border-red-100">
                                    <span>Sisa Tagihan:</span>
                                    <span className="font-mono">{formatRp(inv.balance_due)}</span>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500 italic p-4 bg-slate-50 border border-dashed rounded-lg col-span-full">
                        Belum ada faktur penagihan yang dibuat.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
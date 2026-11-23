import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

export default function TabDelivery({ so }: { so: any }) {
    const { hasPermission } = usePermission();
    const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

    return (
        <Card className="shadow-sm border-t-4 border-t-emerald-500">
            <CardHeader className="pb-3 flex flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2">Dokumen Pengiriman (DO)</CardTitle>
                    <CardDescription>Status fisik barang yang dikirim ke klien</CardDescription>
                </div>
                {hasPermission('delivery_orders.execute') && (
                    <Button size="sm" variant="outline" asChild disabled={so.approval_status !== 'approved'} className="shrink-0">
                        <Link href={route('sales-orders.convert-do', so.id)}>+ Buat DO Baru</Link>
                    </Button>
                )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {so.delivery_orders && so.delivery_orders.length > 0 ? (
                    so.delivery_orders.map((doItem: any) => (
                        <div key={doItem.id} className="p-4 border rounded-xl hover:shadow-md transition-all flex justify-between items-center bg-white">
                            <div>
                                <p className="font-bold text-slate-800 text-lg">{doItem.do_number}</p>
                                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                                    {doItem.status === 'delivered' ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Clock className="size-4 text-amber-500" />}
                                    {doItem.status === 'delivered' ? `Terkirim pada ${formatDate(doItem.delivered_at)}` : 'Menunggu Pengiriman'}
                                </p>
                            </div>
                            <Button variant="secondary" asChild>
                                <a href={route('delivery-orders.print', doItem.id)} target="_blank" rel="noreferrer">Cetak</a>
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500 italic p-4 bg-slate-50 border border-dashed rounded-lg col-span-full">
                        Belum ada dokumen pengiriman yang dibuat.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
import { Card, CardContent } from '@/components/ui/card';

export default function SalesOrderSummary({ so }: { so: any }) {
    const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
    const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-sm">
                <CardContent className="p-4 flex flex-col justify-center">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Tanggal Pesanan</p>
                    <p className="font-medium text-slate-800">{formatDate(so.order_date)}</p>
                </CardContent>
            </Card>
            <Card className="shadow-sm">
                <CardContent className="p-4 flex flex-col justify-center">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Sales Person</p>
                    <p className="font-medium text-slate-800">{so.sales_person?.name || '-'}</p>
                </CardContent>
            </Card>
            <Card className="shadow-sm">
                <CardContent className="p-4 flex flex-col justify-center">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Status Operasional</p>
                    <p className="font-medium capitalize text-slate-800">{so.status}</p>
                </CardContent>
            </Card>
            <Card className="shadow-sm bg-slate-50 border-primary/20">
                <CardContent className="p-4 flex flex-col justify-center">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Grand Total</p>
                    <p className="font-bold text-lg text-primary">{formatRp(so.grand_total)}</p>
                </CardContent>
            </Card>
        </div>
    );
}
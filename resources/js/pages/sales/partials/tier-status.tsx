import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Gift } from 'lucide-react';

export default function TierStatus({ performanceData }: { performanceData: any[] }) {
    const getTierColor = (tier: string) => {
        switch(tier) {
            case 'Platinum': return 'bg-slate-800 text-slate-100 border-slate-700';
            case 'Gold': return 'bg-amber-100 text-amber-700 border-amber-300';
            case 'Silver': return 'bg-gray-100 text-gray-700 border-gray-300';
            default: return 'bg-blue-50 text-blue-700';
        }
    };

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Status Tier Karyawan</CardTitle>
                <CardDescription>Berdasarkan akumulasi Poin</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {(performanceData || []).map((sales: any, i: number) => (
                    <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                        <div>
                            <p className="font-semibold text-sm">{sales.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Sparkles className="size-3 text-purple-500" /> {(sales.points || 0).toLocaleString('id-ID')} Pts
                            </p>
                        </div>
                        <div className="text-right">
                            <Badge variant="outline" className={`text-xs px-2 py-0.5 ${getTierColor(sales.tier)}`}>
                                {sales.tier}
                            </Badge>
                        </div>
                    </div>
                ))}
                {performanceData.length === 0 && (
                    <div className="text-sm text-center text-muted-foreground py-4">Belum ada data tier karyawan.</div>
                )}
                <button className="w-full mt-2 py-2 text-sm text-primary font-medium border border-primary/20 rounded-md hover:bg-primary/5 transition-colors flex justify-center items-center gap-2">
                    <Gift className="size-4" /> Buka Katalog Penukaran Poin
                </button>
            </CardContent>
        </Card>
    );
}
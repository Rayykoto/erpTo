import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, DollarSign, Sparkles, Gift } from 'lucide-react';

export default function KpiStats({ stats }: { stats: any }) {
    const formatRp = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-600 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Total Pendapatan</p>
                            <h3 className="text-2xl font-bold">{formatRp(stats.total_revenue)}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg"><DollarSign className="size-5 text-blue-600" /></div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                        <TrendingUp className="size-4 mr-1" /> {stats.growth} dari bulan lalu
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Poin Reward Didistribusikan</p>
                            <h3 className="text-2xl font-bold flex items-center gap-1">
                                {(stats.total_points_distributed || 0).toLocaleString('id-ID')} <Sparkles className="size-5 text-purple-500 fill-purple-100" />
                            </h3>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg"><Gift className="size-5 text-purple-600" /></div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-muted-foreground">
                        Tersebar ke Seluruh Tim Sales
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 shadow-sm lg:col-span-2">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Pencapaian Target Perusahaan</p>
                            <h3 className="text-2xl font-bold">{stats.target_achievement}%</h3>
                        </div>
                        <div className="p-2 bg-orange-50 rounded-lg"><Target className="size-5 text-orange-600" /></div>
                    </div>
                    <Progress value={stats.target_achievement} className="h-2 mt-4 bg-orange-100 [&>div]:bg-orange-500" />
                    <p className="text-xs text-muted-foreground mt-2">Pantau progres ini untuk memastikan milestone perusahaan tercapai.</p>
                </CardContent>
            </Card>
        </div>
    );
}
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import KpiStats from './partials/kpi-stats';
import MarketTrendChart from './partials/market-chart';
import LeaderboardChart from './partials/leaderboard-chart';
import UpSellingTable from './partials/upselling-table';
import TierStatus from './partials/tier-status';

export default function SalesDashboard({ stats, marketTrend, salesPerformance, upSellingProducts }: any) {
    const performanceData = salesPerformance?.data || salesPerformance || [];
    
    return (
        <AppLayout>
            <Head title="Sales Command Center | ERP-SSG" />
            
            <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            Sales Command Center <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">Gamified Edition</Badge>
                        </h1>
                        <p className="text-muted-foreground mt-1">Pantau kinerja tim, kelola target, dan bagikan reward poin untuk memotivasi konversi.</p>
                    </div>
                </div>

                {/* KPI STATISTIK UTAMA */}
                <KpiStats stats={stats} />

                {/* GRAFIK TREN PASAR & LEADERBOARD SALES */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <MarketTrendChart marketTrend={marketTrend} />
                    <LeaderboardChart performanceData={performanceData} />
                </div>

                {/* UP-SELLING & DATA TABEL REWARD */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <UpSellingTable upSellingProducts={upSellingProducts} />
                    <TierStatus performanceData={performanceData} />
                </div>
            </div>
        </AppLayout>
    );
}
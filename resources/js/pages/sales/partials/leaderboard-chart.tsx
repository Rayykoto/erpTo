import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart3, Trophy } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LeaderboardChart({ performanceData }: { performanceData: any[] }) {
    const hasData = performanceData && performanceData.length > 0;
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="size-5 text-amber-500" /> Sales Leaderboard & Perolehan Poin
                </CardTitle>
                <CardDescription>Penjualan Tertinggi (Juta Rp) vs Poin Gamifikasi yang Didapat</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
                {!hasData ? (
                    <div className="flex flex-col items-center justify-center w-full h-full text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <BarChart3 className="size-10 text-slate-300 mb-3" />
                        <p className="text-sm font-medium text-slate-700">Belum ada data performa</p>
                        <p className="text-xs text-center mt-1 px-4">
                            Grafik akan muncul setelah tim sales mulai check-in kunjungan dan mengumpulkan poin.
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 500}} width={90} />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend />
                            <Bar dataKey="sales" name="Total Penjualan (Juta)" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                            <Bar dataKey="points" name="Sales Points" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={16} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
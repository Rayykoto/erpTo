import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

export default function TargetHeaderAndTable({ 
    userTargets, 
    monthDisplay, 
    handleMonthChange, 
    openTargetModal 
}: any) {
    const { hasPermission } = usePermission();

    const formatRp = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
    };

    const getPercentage = (achieved: number, target: number) => {
        if (target <= 0) return 0;
        return Math.min(Math.round((achieved / target) * 100), 100);
    };

    return (
        <Card className="shadow-sm border-t-4 border-t-slate-700">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div>
                    <CardTitle className="text-lg">Daftar Pencapaian Tim</CardTitle>
                    <CardDescription>Pantau realisasi target setiap anggota tim untuk periode berjalan.</CardDescription>
                </div>
                
                {/* Filter Navigasi Bulan */}
                <div className="flex items-center bg-slate-50 p-1 rounded-lg border gap-1 shadow-sm shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleMonthChange(-1)} className="hover:bg-slate-200 h-8 w-8">
                        <ChevronLeft className="size-4" />
                    </Button>
                    <div className="px-4 font-semibold text-sm min-w-[140px] text-center text-slate-700">
                        {monthDisplay}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleMonthChange(1)} className="hover:bg-slate-200 h-8 w-8">
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                            <tr>
                                <th className="p-4 pl-6 w-1/4">Nama Sales</th>
                                <th className="p-4 w-1/4">Target Bulanan</th>
                                <th className="p-4 w-2/4">Progress Pencapaian (Realisasi)</th>
                                <th className="p-4 pr-6 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {userTargets.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500 bg-slate-50 italic">
                                        Belum ada data tim Sales.
                                    </td>
                                </tr>
                            ) : (
                                userTargets.map((user: any) => {
                                    const percentage = getPercentage(user.achieved_amount, user.target_amount);
                                    const isCompleted = percentage >= 100;
                                    
                                    return (
                                        <tr key={user.user_id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="p-4 pl-6 font-semibold text-slate-800">{user.name}</td>
                                            <td className="p-4">
                                                {user.target_amount > 0 ? (
                                                    <span className="font-mono font-medium text-slate-700">{formatRp(user.target_amount)}</span>
                                                ) : (
                                                    <Badge variant="secondary" className="text-slate-500 bg-slate-100 hover:bg-slate-100 font-normal">Belum Diatur</Badge>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-2 w-full max-w-md">
                                                    <div className="flex justify-between text-xs font-semibold">
                                                        <span className="text-slate-600 font-mono">{formatRp(user.achieved_amount)}</span>
                                                        <span className={isCompleted ? 'text-emerald-600' : 'text-blue-600'}>{percentage}%</span>
                                                    </div>
                                                    <Progress 
                                                        value={percentage} 
                                                        className={`h-2 shadow-inner ${isCompleted ? '[&>div]:bg-emerald-500 bg-emerald-100' : '[&>div]:bg-blue-500 bg-slate-100'}`} 
                                                    />
                                                </div>
                                            </td>
                                            
                                            <td className="p-4 pr-6 text-center">
                                                {hasPermission('sales_visits.execute') && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
                                                    onClick={() => openTargetModal(user)}
                                                >
                                                    <Edit2 className="size-3 mr-2" /> Atur Target
                                                </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
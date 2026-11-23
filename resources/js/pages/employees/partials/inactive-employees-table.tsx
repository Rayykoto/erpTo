import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck } from 'lucide-react';

export default function InactiveEmployeesTable({ inactiveEmployees, onRehire }: any) {
    return (
        <Card className="shadow-sm h-full flex flex-col border-dashed border-2 border-slate-200">
            <CardContent className="flex-1 p-0 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-100/50 text-slate-500 font-medium border-b">
                            <tr>
                                <th className="p-4">Profil Alumni</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-slate-50/30">
                            {inactiveEmployees.map((user: any) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-600">{user.name}</span>
                                            <span className="text-xs text-slate-400">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <Badge variant="outline" className="text-rose-500 border-rose-200 bg-rose-50/50 uppercase text-[10px]">
                                            Resigned / Nonaktif
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button variant="secondary" size="sm" className="h-8 gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white" onClick={() => onRehire(user)}>
                                            <UserCheck className="size-3.5" /> Re-hire (Rekrut)
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {inactiveEmployees.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-12 text-center text-slate-400">Tidak ada riwayat alumni.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
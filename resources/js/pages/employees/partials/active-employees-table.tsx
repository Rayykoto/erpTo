import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, UserMinus, Building2 } from 'lucide-react';

export default function ActiveEmployeesTable({ employees, onEdit, onResign }: any) {
    return (
        <Card className="shadow-sm h-full flex flex-col">
            <CardContent className="flex-1 p-0 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-600 font-medium">
                            <tr>
                                <th className="p-4 w-12 text-center">No</th>
                                <th className="p-4">Profil Karyawan</th>
                                <th className="p-4">Jabatan & Divisi</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {employees.data.map((user: any, index: number) => (
                                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4 text-center text-slate-400 font-medium">{employees.from + index}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800">{user.name}</span>
                                            <span className="text-xs text-slate-500">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px]">
                                                {user.roles?.length > 0 ? user.roles[0].name : 'Tanpa Jabatan'}
                                            </Badge>
                                            {user.division && (
                                                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                                    <Building2 className="size-3" /> {user.division.name}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => onEdit(user)}>
                                                <Pencil className="size-3.5" /> Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" className="h-8 gap-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-500 hover:text-white" onClick={() => onResign(user)}>
                                                <UserMinus className="size-3.5" /> Resign
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {employees.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-500 bg-slate-50">Belum ada karyawan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINASI */}
                {employees.links && employees.links.length > 3 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 mt-auto border-t">
                        <span className="text-xs text-slate-500 font-medium mb-3 sm:mb-0">
                            Menampilkan {employees.from || 0} - {employees.to || 0} dari {employees.total}
                        </span>
                        <div className="flex gap-1 shadow-sm rounded-md">
                            {employees.links.map((link: any, i: number) => (
                                <Link key={i} href={link.url || '#'} preserveScroll
                                    className={`px-3 py-1.5 text-xs font-medium border transition-colors 
                                        ${link.active ? 'bg-primary text-white border-primary z-10' : 'bg-white text-slate-600'} 
                                        ${!link.url ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''} -ml-px`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
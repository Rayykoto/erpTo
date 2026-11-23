import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, User, Edit3, FilePlus2, FileClock, ArrowRight } from 'lucide-react';

export default function TabAuditTrail({ so }: { so: any }) {
    return (
        <Card className="shadow-sm border-t-4 border-t-slate-400">
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg">Jejak Rekam Aktivitas</CardTitle>
                <CardDescription>Histori perubahan data dan persetujuan oleh pengguna</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                {so.activities && so.activities.length > 0 ? (
                    <div className="relative border-l-2 border-slate-200 ml-4 py-2 space-y-8">
                        {[...so.activities].reverse().map((log: any) => {
                            let Icon = FileClock; 
                            let iconColor = "text-slate-500";
                            let bgColor = "bg-slate-100 border-slate-300";

                            if (log.event === 'created') {
                                Icon = FilePlus2;
                                iconColor = "text-emerald-600";
                                bgColor = "bg-emerald-50 border-emerald-200";
                            } else if (log.event === 'updated') {
                                Icon = Edit3;
                                iconColor = "text-blue-600";
                                bgColor = "bg-blue-50 border-blue-200";
                            } else if (log.description && log.description.includes('disetujui')) {
                                Icon = CheckCircle2;
                                iconColor = "text-amber-600";
                                bgColor = "bg-amber-50 border-amber-200";
                            }

                            return (
                                <div key={log.id} className="relative pl-8 pr-4">
                                    <span className={`absolute -left-[17px] top-0 flex size-8 items-center justify-center rounded-full border-2 ${bgColor} ring-4 ring-white`}>
                                        <Icon className={`size-4 ${iconColor}`} />
                                    </span>

                                    <div className="flex flex-col gap-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-slate-800">
                                                {log.description}
                                            </p>
                                            <span className="text-xs text-slate-400 font-medium">
                                                {new Date(log.created_at).toLocaleString('id-ID', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                            <User className="size-3.5" /> 
                                            {log.causer ? log.causer.name : 'Sistem Otomatis'}
                                        </div>

                                        {log.properties?.old && log.properties?.attributes && (
                                            <div className="mt-3 bg-white border border-slate-200 rounded-lg p-3 text-xs font-mono w-full overflow-x-auto shadow-sm">
                                                {Object.keys(log.properties.attributes).map((key) => (
                                                    <div key={key} className="flex flex-col gap-1 mb-2 last:mb-0">
                                                        <span className="text-slate-400 capitalize font-sans text-[11px] font-bold tracking-wider">{key.replace('_', ' ')}:</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 line-through decoration-rose-400">
                                                                {String(log.properties.old[key]) || 'kosong'}
                                                            </span>
                                                            <ArrowRight className="size-4 text-slate-300 shrink-0" />
                                                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold">
                                                                {String(log.properties.attributes[key])}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center p-8 text-sm text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                        Belum ada riwayat aktivitas untuk dokumen ini.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
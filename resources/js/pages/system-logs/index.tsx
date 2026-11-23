import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, User, ArrowRight, Clock, ShieldAlert, FilePlus2, Edit3, Trash2 } from 'lucide-react';

export default function SystemLogsIndex({ logs, tabs, activeTab }: any) {
    
    // Fungsi untuk mengganti Tab tanpa me-refresh seluruh halaman (Inertia partial reload)
    const handleTabChange = (tabId: string) => {
        router.get(
            route('system-logs.index'),
            { tab: tabId },
            { preserveState: true, preserveScroll: true, only: ['logs', 'activeTab'] }
        );
    };

    return (
        <AppLayout>
            <Head title="Pusat Log Sistem" />

            <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full">
                {/* HEADER SECTION */}
                <div className="flex flex-col gap-2 mb-2">
                    <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800 tracking-tight">
                        <Activity className="size-7 text-primary" /> Pusat Log Aktivitas (Audit Trail)
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Pantau seluruh rekam jejak pembuatan, perubahan, dan penghapusan data secara global.
                    </p>
                </div>

                <Card className="shadow-sm border-t-4 border-t-slate-800">
                    <CardHeader className="pb-4 border-b border-slate-100">
                        {/* NAVIGASI TABS */}
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <TabsList className="flex flex-wrap h-auto p-1 bg-slate-50 border border-slate-200 rounded-lg justify-start">
                                {tabs.map((tab: any) => (
                                    <TabsTrigger 
                                        key={tab.id} 
                                        value={tab.id}
                                        className="rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary"
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 pl-6 w-56 whitespace-nowrap">Waktu & Pelaku</th>
                                        <th className="p-4 w-32 text-center">Aksi</th>
                                        <th className="p-4 w-80">Deskripsi Aktivitas</th>
                                        {/* <th className="p-4 pr-6">Rincian Perubahan (Diff)</th> */}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {logs.data && logs.data.length > 0 ? (
                                        logs.data.map((log: any) => {
                                            
                                            // Menentukan visual berdasarkan event
                                            let EventIcon = Activity;
                                            let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
                                            let badgeColor = "text-slate-600 border-slate-300";

                                            if (log.event === 'created') {
                                                EventIcon = FilePlus2;
                                                badgeVariant = "default";
                                                badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                                            } else if (log.event === 'updated') {
                                                EventIcon = Edit3;
                                                badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
                                            } else if (log.event === 'deleted') {
                                                EventIcon = Trash2;
                                                badgeVariant = "destructive";
                                            }

                                            return (
                                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="p-4 pl-6 align-top">
                                                        <div className="flex flex-col gap-1.5">
                                                            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                                                                <User className="size-3.5 text-slate-400" />
                                                                {log.causer ? log.causer.name : 'Sistem Otomatis'}
                                                            </span>
                                                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 w-fit px-2 py-0.5 rounded-md">
                                                                <Clock className="size-3 text-slate-400" />
                                                                {new Date(log.created_at).toLocaleString('id-ID', {
                                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                                    hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="p-4 align-top text-center">
                                                        <Badge variant={badgeVariant} className={`capitalize flex justify-center w-full gap-1.5 py-1 ${badgeColor} font-normal shadow-sm`}>
                                                            <EventIcon className="size-3.5" /> {log.event}
                                                        </Badge>
                                                    </td>

                                                    <td className="p-4 align-top">
                                                        <p className="font-medium text-slate-800 mb-2 leading-snug">{log.human_readable_message || log.description}</p>
                                                        <span className="text-[10px] text-slate-500 font-mono font-semibold uppercase tracking-wider bg-slate-100 px-2 py-1 rounded border">
                                                            ID Dokumen: {log.subject_id}
                                                        </span>
                                                    </td>

                                                    <td className="p-4 pr-6 align-top">
                                                        {log.properties && log.properties.attributes ? (
                                                            <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 text-xs w-full shadow-inner">
                                                                <div className="flex flex-col gap-2">
                                                                    {Object.keys(log.properties.attributes).map((key) => {
                                                                        // Sembunyikan field yang terlalu teknis
                                                                        if (['remember_token', 'password', 'updated_at'].includes(key)) return null;
                                                                        
                                                                        const oldVal = log.properties.old ? String(log.properties.old[key] ?? 'kosong') : null;
                                                                        const newVal = String(log.properties.attributes[key] ?? 'kosong');

                                                                        // Sembunyikan baris jika tidak ada perubahan nilai (pada event update)
                                                                        if (log.event === 'updated' && oldVal === newVal) return null;

                                                                        return (
                                                                            <div key={key} className="flex flex-col gap-0.5">
                                                                                <span className="text-slate-500 capitalize font-medium text-[10px] tracking-wider mb-0.5">
                                                                                    {key.replace(/_/g, ' ')}
                                                                                </span>
                                                                                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                                                                                    {oldVal && (
                                                                                        <>
                                                                                            <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 line-through decoration-rose-400 break-all shadow-sm">
                                                                                                {oldVal}
                                                                                            </span>
                                                                                            <ArrowRight className="size-3 text-slate-400 shrink-0" />
                                                                                        </>
                                                                                    )}
                                                                                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium break-all shadow-sm">
                                                                                        {newVal}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 text-[11px] italic flex items-center gap-1">
                                                                Tidak ada rincian atribut data.
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-slate-500 bg-slate-50 border-b border-dashed">
                                                <ShieldAlert className="size-10 mx-auto text-slate-300 mb-3" />
                                                <p className="font-medium text-slate-600">Belum ada rekam aktivitas</p>
                                                <p className="text-xs mt-1">Aktivitas pada modul ini akan otomatis tercatat di sini.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINASI BAWAAN LARAVEL YANG SUDAH DIPERMAK */}
                        {/* PAGINASI BAWAAN LARAVEL YANG SUDAH DIPERMAK */}
                        {logs.links && logs.links.length > 3 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border-t border-slate-100 gap-4">
                                <span className="text-xs text-slate-500 font-medium hidden sm:block">
                                    Menampilkan Halaman <span className="text-slate-800 font-bold">{logs.current_page}</span> dari <span className="text-slate-800 font-bold">{logs.last_page}</span>
                                </span>
                                
                                <div className="flex flex-wrap items-center justify-center gap-1 shadow-sm rounded-md bg-slate-50 p-1 border border-slate-200">
                                    {logs.links.map((link: any, index: number) => {
                                        // Bersihkan label bawaan Laravel terlepas dari bahasa (Inggris/Indonesia)
                                        let label = link.label;
                                        const lowerLabel = label.toLowerCase();
                                        
                                        if (lowerLabel.includes('previous') || lowerLabel.includes('sebelum') || label.includes('&laquo;')) {
                                            label = '«';
                                        } else if (lowerLabel.includes('next') || lowerLabel.includes('lanjut') || label.includes('&raquo;')) {
                                            label = '»';
                                        }

                                        return (
                                            <Button 
                                                key={index} 
                                                variant={link.active ? "default" : "ghost"} 
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url, { preserveScroll: true, preserveState: true })}
                                                className={`min-w-[32px] h-8 px-2.5 text-xs font-medium transition-all ${
                                                    !link.url ? "opacity-40 cursor-not-allowed" : ""
                                                } ${
                                                    link.active ? "bg-primary text-primary-foreground hover:bg-primary shadow-sm" : "text-slate-600 hover:bg-slate-200"
                                                }`}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: label }} />
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
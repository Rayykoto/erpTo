import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, CheckCircle2 } from 'lucide-react';

const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : '??';
const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function TaskDetailModal({ task, currentUser, holidays = [], onClose }: any) {
    // Jika tidak ada task.id, berarti ini adalah proses CREATE (Tugas Baru)
    const isNewTask = !task.id;

    const { data, setData, put, post, processing, isDirty } = useForm({
        title: task.title || '',
        description: task.description || '',
        team: task.team || '',
        brand: task.brand || '',
        project: task.project || '',
        start_date: task.start_date || (isNewTask ? getTodayDate() : ''),
        working_days: task.working_days || 1,
        status: task.status || 'pending', // Bawaan status dari tombol tambah di kolom
        is_assignable: true,
    });
    
    const [commentText, setCommentText] = useState('');
    const [isPostingComment, setIsPostingComment] = useState(false);

    const handleSaveDetail = () => {
        if (isNewTask) {
            post(route('tasks.store'), { 
                preserveScroll: true,
                onSuccess: () => onClose()
            });
        } else {
            put(route('tasks.update', task.id), { preserveScroll: true });
        }
    };

    const handlePostComment = () => {
        if (!commentText.trim() || isNewTask) return; // Komen dinonaktifkan jika tugas belum disimpan
        setIsPostingComment(true);
        router.post(route('tasks.comments.store', task.id), { comment: commentText }, {
            preserveScroll: true,
            onSuccess: () => { setCommentText(''); setIsPostingComment(false); }
        });
    };

    const computePredictedEndDate = (start: string, days: number) => {
        if (!start || days < 1) return null;
        let d = new Date(start);
        let added = 1; 
        
        while (added < days) {
            d.setDate(d.getDate() + 1); 
            const dayOfWeek = d.getDay();
            const dateStr = d.toISOString().split('T')[0];
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isHoliday = holidays.includes(dateStr); 

            if (!isWeekend && !isHoliday) added++;
        }
        return d;
    };
    
    const predictedEnd = computePredictedEndDate(data.start_date, data.working_days);
    const isCompleted = task.status === 'completed';

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col overflow-hidden bg-slate-50 p-0">
                
                {/* HEADER MODAL YANG LEBIH RAPI & BERSIH */}
                <div className={`shrink-0 px-6 py-4 border-b shadow-sm ${isCompleted && !isNewTask ? 'bg-emerald-50/50' : 'bg-white'}`}>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-base font-semibold text-slate-800">
                                {isNewTask ? 'Buat Tugas Baru' : 'Detail Tugas'}
                            </DialogTitle>
                            {/* {!isNewTask && (
                                <Badge variant="outline" className="bg-white">{task.status}</Badge>
                            )} */}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {isCompleted && !isNewTask && <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />}
                            <Input 
                                placeholder="Masukkan Judul Tugas..."
                                value={data.title} 
                                onChange={e => setData('title', e.target.value)} 
                                autoFocus={isNewTask}
                                className={`text-xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-8 bg-transparent ${isCompleted && !isNewTask ? 'text-slate-600' : ''}`}
                            />
                        </div>
                        
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-[11px] text-muted-foreground">
                                Pembuat: <b className="text-foreground">{task.creator?.name || currentUser?.name || 'Sistem'}</b>
                            </span>
                            <div className="flex gap-2 items-center">
                                {(isDirty || isNewTask) && (
                                    <Button size="sm" onClick={handleSaveDetail} disabled={processing || !data.title} className="h-7 bg-primary">
                                        {isNewTask ? 'Simpan Tugas' : 'Simpan Perubahan'}
                                    </Button>
                                )}
                                {!isNewTask && <Badge variant="secondary" className="font-normal">{task.assignee?.name || 'Unassigned'}</Badge>}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-white">
                        
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Kategori Project</label>
                                <Input value={data.project} onChange={e => setData('project', e.target.value)} placeholder="Misal: Website Baru" className="h-8 bg-white" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Brand / Tag</label>
                                <Input value={data.brand} onChange={e => setData('brand', e.target.value)} placeholder="Misal: YOUTUBE" className="h-8 bg-white" />
                            </div>
                            
                            <div className="col-span-2 grid grid-cols-3 gap-4 border-t pt-4 mt-2 border-slate-200">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Tgl Mulai</label>
                                    <Input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="h-8 bg-white" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Durasi Kerja</label>
                                    <div className="flex items-center gap-2">
                                        <Input type="number" min="1" value={data.working_days} onChange={e => setData('working_days', parseInt(e.target.value) || 1)} className="h-8 bg-white w-20" />
                                        <span className="text-xs text-muted-foreground font-medium">Hari</span>
                                    </div>
                                </div>
                                <div className="space-y-1 bg-emerald-50/50 p-2 rounded border border-emerald-100">
                                    <label className="text-[10px] font-bold text-emerald-600 uppercase">Target Selesai</label>
                                    <div className="font-mono text-sm font-semibold text-emerald-800">
                                        {predictedEnd ? predictedEnd.toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'}) : '-'}
                                    </div>
                                    <div className="text-[8px] text-emerald-700 leading-none mt-1">(Libur Nasional dilewati)</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold mb-2 block text-foreground">Detail / Instruksi Kerja</label>
                            <Textarea 
                                className="min-h-[120px] resize-y"
                                placeholder="Tulis rincian langkah pengerjaan tugas di sini..."
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-[320px] bg-slate-50 border-l flex flex-col shrink-0">
                        <div className="p-4 border-b bg-slate-100/50">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                <MessageSquare className="size-4 text-primary" /> Riwayat Aktivitas
                            </h3>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                            {isNewTask ? (
                                <p className="text-xs text-muted-foreground text-center py-4 italic">Simpan tugas terlebih dahulu untuk mengaktifkan riwayat komentar.</p>
                            ) : task.comments && task.comments.length > 0 ? (
                                task.comments.map((comment: any) => (
                                    <div key={comment.id} className="flex gap-2">
                                        <Avatar className="size-6 border shrink-0 mt-0.5">
                                            <AvatarFallback className="text-[8px] bg-primary/20 text-primary font-bold">
                                                {getInitials(comment.user?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col flex-1 bg-white p-2.5 rounded-lg border text-sm shadow-sm">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-[11px]">{comment.user?.name}</span>
                                                <span className="text-[9px] text-muted-foreground">{new Date(comment.created_at).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <p className="text-slate-700">{comment.comment}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground text-center py-4 italic">Belum ada aktivitas tercatat.</p>
                            )}
                        </div>

                        {!isNewTask && (
                            <div className="p-4 bg-white border-t flex flex-col gap-2 shrink-0">
                                <Textarea 
                                    placeholder="Update status tim..."
                                    className="min-h-[60px] resize-none text-sm"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                                <Button size="sm" className="w-full" onClick={handlePostComment} disabled={!commentText.trim() || isPostingComment}>
                                    Kirim Laporan
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
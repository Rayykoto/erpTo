import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserCheck } from 'lucide-react';

export default function RehireEmployeeModal({ user, isOpen, onClose, roles, divisions }: any) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        name: '', email: '', role: '', division_id: '',
    });

    useEffect(() => {
        if (user) {
            setData({ name: user.name, email: user.email, role: '', division_id: '' });
            clearErrors();
        }
    }, [user, isOpen]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('employee.store'), {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md border-emerald-200">
                <DialogHeader>
                    <DialogTitle className="text-emerald-700 flex items-center gap-2"><UserCheck className="size-5" /> Aktifkan Kembali Karyawan</DialogTitle>
                    <DialogDescription>Rekrut ulang <b>{user?.name}</b> ke dalam perusahaan.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4 mt-2">
                    <div className="bg-slate-50 p-3 rounded-md border text-sm text-slate-500 mb-2">
                        Akun lama akan dipulihkan, tetapkan jabatan baru untuk mereka.
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold">Tugaskan Jabatan Baru</label>
                        <select value={data.role} onChange={e => setData('role', e.target.value)} className="flex h-10 w-full rounded-md border px-3 text-sm" required>
                            <option value="" disabled>Pilih Jabatan...</option>
                            {roles.map((r: any) => <option key={r.id} value={r.name}>{r.name}</option>)}
                        </select>
                        {errors.role && <span className="text-xs text-rose-500">{errors.role}</span>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold">Divisi</label>
                        <select value={data.division_id} onChange={e => setData('division_id', e.target.value)} className="flex h-10 w-full rounded-md border px-3 text-sm">
                            <option value="">-- Tanpa Divisi --</option>
                            {divisions.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" disabled={processing}>
                            <UserCheck className="size-4" /> {processing ? 'Memproses...' : 'Aktifkan Karyawan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
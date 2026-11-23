import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function EditEmployeeModal({ user, isOpen, onClose, roles, divisions }: any) {
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        name: '', email: '', role: '', division_id: '', password: '',
    });

    useEffect(() => {
        if (user) {
            setData({
                name: user.name,
                email: user.email,
                role: user.roles?.length > 0 ? user.roles[0].name : '',
                division_id: user.division_id || '',
                password: '',
            });
            clearErrors();
        }
    }, [user, isOpen]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('employee.update', user.id), {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Profil Karyawan</DialogTitle>
                    <DialogDescription>Perbarui data atau ubah jabatan staf ini.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4 mt-2">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold">Nama Lengkap</label>
                        <Input value={data.name} onChange={e => setData('name', e.target.value)} required />
                        {errors.name && <span className="text-xs text-rose-500">{errors.name}</span>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold">Email</label>
                        <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                        {errors.email && <span className="text-xs text-rose-500">{errors.email}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold">Jabatan (Role)</label>
                            <select value={data.role} onChange={e => setData('role', e.target.value)} className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" required>
                                <option value="" disabled>Pilih Jabatan...</option>
                                {roles.map((role: any) => <option key={role.id} value={role.name}>{role.name}</option>)}
                            </select>
                            {errors.role && <span className="text-xs text-rose-500">{errors.role}</span>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold">Divisi</label>
                            <select value={data.division_id} onChange={e => setData('division_id', e.target.value)} className="flex h-10 w-full rounded-md border bg-background px-3 text-sm">
                                <option value="">-- Tanpa Divisi --</option>
                                {divisions.map((div: any) => <option key={div.id} value={div.id}>{div.name}</option>)}
                            </select>
                            {errors.division_id && <span className="text-xs text-rose-500">{errors.division_id}</span>}
                        </div>
                    </div>
                    <div className="space-y-1.5 p-3 bg-slate-50 border rounded-md mt-2">
                        <label className="text-sm font-semibold">Ganti Password (Opsional)</label>
                        <Input type="password" placeholder="Kosongkan jika tidak diubah" value={data.password} onChange={e => setData('password', e.target.value)} />
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
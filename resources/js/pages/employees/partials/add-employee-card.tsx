import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPlus, ShieldAlert } from 'lucide-react';

export default function AddEmployeeCard({ roles, divisions }: { roles: any[], divisions: any[] }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', email: '', role: '', division_id: '',
    });

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('employee.store'), {
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    return (
        <Card className="shadow-sm border-t-4 border-t-primary sticky top-6">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus className="size-5" /> Undang Karyawan
                </CardTitle>
                <CardDescription>Akun otomatis terhubung jika email sudah ada.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submitAdd} className="flex flex-col gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                        <Input placeholder="Misal: Budi Santoso" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        {errors.name && <span className="text-xs text-rose-500">{errors.name}</span>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Alamat Email</label>
                        <Input type="email" placeholder="budi@perusahaan.com" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                        {errors.email && <span className="text-xs text-rose-500">{errors.email}</span>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Jabatan (Role)</label>
                        <select value={data.role} onChange={(e) => setData('role', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                            <option value="" disabled>Pilih Jabatan...</option>
                            {roles.map((role: any) => <option key={role.id} value={role.name}>{role.name}</option>)}
                        </select>
                        {errors.role && <span className="text-xs text-rose-500">{errors.role}</span>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Divisi</label>
                        <select value={data.division_id} onChange={(e) => setData('division_id', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">-- Tanpa Divisi --</option>
                            {divisions.map((div: any) => <option key={div.id} value={div.id}>{div.name}</option>)}
                        </select>
                        {errors.division_id && <span className="text-xs text-rose-500">{errors.division_id}</span>}
                    </div>
                    <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2.5 rounded border border-amber-100 flex gap-2">
                        <ShieldAlert className="size-4 shrink-0" />
                        <span>Password default: <b>SSGand123!</b></span>
                    </div>
                    <Button type="submit" disabled={processing} className="w-full gap-2 mt-2">
                        <UserPlus className="size-4" /> {processing ? 'Memproses...' : 'Tambahkan Karyawan'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Crown, Lock, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';

interface Props {
    isLimitReached: boolean;
    currentPackage: string;
    maxCompanies: number;
}

export default function CreateCompany({ isLimitReached, currentPackage, maxCompanies }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        logo: null as File | null,
        address: '',
        director: '',
    });
    
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tenant.store'), {
            onSuccess: () => reset(), 
        });
    };

    return (
        <AppLayout>
            <Head title="Create Company" />
            
            <div className="flex flex-col gap-6 p-6 mx-auto w-full">
                {isLimitReached ? (
                    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col items-center justify-center text-center p-10 md:p-16 relative">
                        {/* Efek Latar Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
                        
                        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-6 relative z-10 border border-red-100 shadow-sm">
                            <Lock className="size-8" />
                        </div>
                        
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 relative z-10">
                            Limit Cabang Tercapai
                        </h2>
                        
                        <p className="text-slate-500 max-w-md mb-8 relative z-10">
                            Anda saat ini berada di paket <strong>{currentPackage}</strong> yang memiliki batas maksimal <strong>{maxCompanies} Perusahaan/Cabang</strong>. 
                            Upgrade paket Anda untuk membuka akses ke pembuatan cabang tanpa batas dalam satu platform terpusat.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8">
                                {/* Ganti route ini dengan route halaman billing/pricing Anda nantinya */}
                                <Link href={route('dashboard')}> 
                                    <Crown className="size-4 mr-2" />
                                    Upgrade ke Premium
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                                <Link href={route('dashboard')}>
                                    Kembali ke Dashboard
                                </Link>
                            </Button>
                        </div>

                        {/* Fitur Highlights Pendek */}
                        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left border-t border-slate-100 pt-8 w-full max-w-3xl relative z-10">
                            <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
                                <Building2 className="size-5 text-slate-400" />
                                <h4 className="text-sm font-semibold text-slate-900">Multi-Holding</h4>
                                <p className="text-xs text-slate-500">Kelola puluhan anak perusahaan dalam 1 akun pusat.</p>
                            </div>
                            <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
                                <CheckCircle2 className="size-5 text-slate-400" />
                                <h4 className="text-sm font-semibold text-slate-900">Isolasi Data Aman</h4>
                                <p className="text-xs text-slate-500">Database & akses staf tiap cabang dijamin terpisah total.</p>
                            </div>
                            <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
                                <ArrowRight className="size-5 text-slate-400" />
                                <h4 className="text-sm font-semibold text-slate-900">Instan Setup</h4>
                                <p className="text-xs text-slate-500">Workspace baru aktif secara real-time tanpa delay server.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* 
                      KONDISI 2: JIKA MASIH ADA KUOTA LIMIT, TAMPILKAN FORM SEPERTI BIASA 
                    */
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Buat Perusahaan Baru</h2>
                            <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                Paket {currentPackage} (Max {maxCompanies} Cabang)
                            </div>
                        </div>
                        
                        <form onSubmit={submit} className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                {/* Input Nama Perusahaan */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Perusahaan <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: PT Sukses Makmur"
                                        required
                                    />
                                    {errors.name && <span className="text-sm text-destructive">{errors.name}</span>}
                                </div>

                                {/* Input Logo */}
                                <div className="space-y-2">
                                    <Label htmlFor="logo">Logo Perusahaan</Label>
                                    <Input
                                        id="logo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('logo', e.target.files ? e.target.files[0] : null)}
                                        className="cursor-pointer"
                                    />
                                    {errors.logo && <span className="text-sm text-destructive">{errors.logo}</span>}
                                </div>

                                {/* Input Nama Direktur */}
                                <div className="space-y-2">
                                    <Label htmlFor="director">Nama Direktur</Label>
                                    <Input
                                        id="director"
                                        type="text"
                                        value={data.director}
                                        onChange={(e) => setData('director', e.target.value)}
                                        placeholder="Contoh: Budi Santoso"
                                    />
                                    {errors.director && <span className="text-sm text-destructive">{errors.director}</span>}
                                </div>
                            </div>

                            {/* Textarea Alamat */}
                            <div className="space-y-2">
                                <Label htmlFor="address">Alamat Perusahaan</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Masukkan alamat lengkap perusahaan..."
                                    rows={3}
                                    className="resize-none"
                                />
                                {errors.address && <span className="text-sm text-destructive">{errors.address}</span>}
                            </div>
                            
                            {/* Tombol Submit */}
                            <div className="flex justify-end mt-2">
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="w-full sm:w-auto"
                                >
                                    {processing ? 'Membuat Database...' : 'Buat Perusahaan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, FileQuestion, ServerCrash, Lock, ArrowLeft, Home } from 'lucide-react';

export default function ErrorPage({ status }: { status: number }) {
    // Tentukan konten berdasarkan status kode HTTP
    const getErrorContent = () => {
        switch (status) {
            case 403:
                return {
                    title: '403 - Akses Ditolak',
                    description: 'Maaf, Anda tidak memiliki hak akses (Permission) untuk membuka halaman atau melakukan tindakan ini.',
                    icon: <ShieldAlert className="size-20 text-rose-500 mb-6" />,
                    color: 'text-rose-600'
                };
            case 404:
                return {
                    title: '404 - Tidak Ditemukan',
                    description: 'Halaman atau data dokumen yang Anda cari tidak ditemukan. Mungkin sudah dihapus atau URL tidak valid.',
                    icon: <FileQuestion className="size-20 text-blue-500 mb-6" />,
                    color: 'text-blue-600'
                };
            case 401:
                return {
                    title: '401 - Sesi Habis',
                    description: 'Sesi login Anda telah berakhir atau tidak valid. Silakan login kembali untuk melanjutkan.',
                    icon: <Lock className="size-20 text-amber-500 mb-6" />,
                    color: 'text-amber-600'
                };
            case 500:
            case 503:
                return {
                    title: `${status} - Gangguan Server`,
                    description: 'Sistem sedang mengalami kendala teknis atau pemeliharaan. Tim kami sedang menanganinya.',
                    icon: <ServerCrash className="size-20 text-slate-500 mb-6" />,
                    color: 'text-slate-600'
                };
            default:
                return {
                    title: `${status} - Terjadi Kesalahan`,
                    description: 'Sistem mendeteksi kesalahan yang tidak terduga.',
                    icon: <ShieldAlert className="size-20 text-slate-400 mb-6" />,
                    color: 'text-slate-600'
                };
        }
    };

    const content = getErrorContent();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
            <Head title={`Error ${status}`} />
            
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center flex flex-col items-center">
                {content.icon}
                
                <h1 className={`text-2xl font-black tracking-tight mb-2 ${content.color}`}>
                    {content.title}
                </h1>
                
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                    {content.description}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                    <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
                        <ArrowLeft className="size-4" /> Kembali
                    </Button>
                    <Button asChild className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                        <Link href={route('dashboard')}>
                            <Home className="size-4" /> Ke Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
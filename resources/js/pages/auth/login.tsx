import { Head, Link, useForm } from '@inertiajs/react';
import { LogIn, Mail, Lock, Sparkles, LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import GuestLayout from '@/layouts/guest-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in - ERPto" />

            <main className="w-full py-16 flex-1 flex flex-col items-center justify-center relative overflow-hidden min-h-[90vh]">
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="w-full max-w-md mx-auto px-4 sm:px-6 relative z-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-600 text-xs font-semibold mb-4 shadow-sm animate-in fade-in duration-500">
                            <Sparkles className="size-3.5 text-red-500 animate-pulse" />
                            <span>Selamat Datang Kembali</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            Masuk ke Akun Anda
                        </h1>
                        <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                            Silakan masukkan email dan kata sandi Anda untuk mengakses workspace.
                        </p>
                    </div>

                    {/* FORM CARD */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-6 sm:p-8">
                        
                        {status && (
                            <div className="mb-6 text-center text-sm font-medium text-emerald-600 bg-emerald-50 py-3 rounded-xl border border-emerald-100">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            {/* Email Address */}
                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold text-slate-800 mb-1.5">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        autoFocus
                                        placeholder="email@perusahaan.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label htmlFor="password" className="block text-xs font-semibold text-slate-800">
                                        Kata Sandi <span className="text-red-500">*</span>
                                    </label>
                                    {canResetPassword && (
                                        <Link 
                                            href={route('password.request')} 
                                            className="text-[11px] font-semibold text-red-600 hover:text-red-700 transition-colors"
                                        >
                                            Lupa sandi?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                                    />
                                </div>
                                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 text-red-600 shadow-sm focus:ring-red-500/20 cursor-pointer"
                                />
                                <label htmlFor="remember" className="text-xs font-medium text-slate-600 cursor-pointer select-none">
                                    Ingat saya di perangkat ini
                                </label>
                            </div>

                            {/* TOMBOL SUBMIT */}
                            <div className="pt-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3.5 px-6 rounded-full bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 transition-all disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <LoaderCircle className="size-4 animate-spin" />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="size-4" />
                                            <span>Masuk ke Dashboard</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* <div className="mt-8 text-center text-xs sm:text-sm text-slate-500">
                        Belum punya akun workspace?{' '}
                        <Link href={route('register')} className="text-red-600 font-bold hover:text-red-700 transition">
                            Daftar Gratis 14 Hari
                        </Link>
                    </div> */}
                </div>
            </main>
        </>
    );
}
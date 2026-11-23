import { Head } from '@inertiajs/react';
import GuestLayout from '@/layouts/guest-layout';
import { 
    ArrowRight, Lock, Building, Kanban, IdCard, Receipt, Warehouse, 
    MonitorSmartphone, Trophy, Shield, Check, PhoneCall, Sparkles,
    GitBranch, Server, ArrowUpRight, Wrench, Code2, Layers, Database, Cpu
} from 'lucide-react';
import { useState } from 'react';

export default function Home() {
    const [activeEcosystemTab, setActiveEcosystemTab] = useState<'dashboard' | 'tasks' | 'so'>('dashboard');

    const ecosystemTabs = {
        dashboard: {
            id: 'dashboard' as const,
            label: 'Dashboard Utama',
            imgSrc: '/assets/image/Dashboard.png',
            url: 'erp.domainanda.com/dashboard',
            badge: 'Dashboard'
        },
        tasks: {
            id: 'tasks' as const,
            label: 'Kanban & Timeline',
            imgSrc: '/assets/image/Tasks & Timeline.png', 
            url: 'erp.domainanda.com/tasks',
            badge: 'Manajemen Tugas'
        },
        so: {
            id: 'so' as const,
            label: 'Detail Sales Order',
            imgSrc: '/assets/image/detail so.png',
            url: 'erp.domainanda.com/sales-orders/1',
            badge: 'Order Penjualan'
        }
    };

    const currentTab = ecosystemTabs[activeEcosystemTab];

    return (
        <GuestLayout>
            <Head title="ERPto — Open-Source Multi-Tenant ERP" />

            {/* HERO SECTION */}
            <section className="max-w-7xl mx-auto px-6 pt-14 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Kiri: Nilai Jual & Penjelasan */}
                    <div className="lg:col-span-5 pt-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-medium mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            <span>Open-Source Multi-Tenant ERP</span>
                        </div>
                        
                        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.15] mb-5 font-sans">
                            Aplikasi ERP Platform untuk semua operasional anda.
                        </h1>
                        <p className="text-base text-neutral-600 leading-relaxed mb-7 max-w-lg">
                            <b>ERP bukan cuma untuk Admin.</b> ERPto dirancang agar seluruh karyawan Anda — dari tim lapangan, sales, hingga manajemen — bisa berkolaborasi langsung dalam satu sistem <b>tanpa batas jumlah user dan tanpa biaya lisensi</b>.
                        </p>

                        <ul className="space-y-3.5 mb-8 text-sm font-medium text-neutral-800">
                            {[
                                "Akses Tanpa Batas User (Presensi, Tugas & KPI)",
                                "Isolasi Data Multi-Perusahaan & Holding Otomatis",
                                "Purchase Order Pintar & Penerimaan Barang Instan",
                                "Target Penjualan Real-Time & Hak Akses Dinamis"
                            ].map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2.5">
                                    <Check className="w-4 h-4 text-red-500 shrink-0 stroke-[3]" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-wrap items-center gap-3">
                            <a 
                                href="https://github.com/Rayykoto/ERPto" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium shadow-sm shadow-red-500/20 transition"
                            >
                                <GitBranch className="size-4" />
                                <span>Ambil di GitHub</span>
                            </a>
                            <a 
                                href="https://wa.me/6281314633490?text=Halo,%20saya%20tertarik%20untuk%20konsultasi%20setup%20/%20kustomisasi%20ERPto" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 text-sm font-medium shadow-sm transition hover:border-neutral-300"
                            >
                                <PhoneCall className="size-4 text-red-500" />
                                <span>Konsultasi Custom</span>
                            </a>
                        </div>
                    </div>

                    {/* Kanan: Tampilan Interaktif Aplikasi */}
                    <div className="lg:col-span-7" id="ecosystem">
                        <div className="flex items-center justify-end mb-4 overflow-x-auto pb-1">
                            <div className="inline-flex p-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">
                                {Object.values(ecosystemTabs).map((tab) => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveEcosystemTab(tab.id)}
                                        className={`px-3.5 py-1 rounded-full font-semibold transition flex items-center gap-1.5 ${
                                            activeEcosystemTab === tab.id 
                                                ? 'bg-white text-neutral-900 shadow-sm' 
                                                : 'hover:text-neutral-900 font-medium'
                                        }`}
                                    >
                                        {activeEcosystemTab === tab.id && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                        )}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mockup Jendela Browser */}
                        <div className="rounded-3xl border border-neutral-200 bg-white shadow-xl shadow-neutral-200/50 overflow-hidden">
                            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 mr-2">
                                        <span className="w-3 h-3 rounded-full bg-neutral-300 inline-block"></span>
                                        <span className="w-3 h-3 rounded-full bg-neutral-300 inline-block"></span>
                                        <span className="w-3 h-3 rounded-full bg-neutral-300 inline-block"></span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs font-mono text-neutral-600 transition-all">
                                        <Lock className="size-3 text-neutral-400" />
                                        <span>{currentTab.url}</span>
                                    </div>
                                </div>
                                <div className="items-center gap-2 text-xs hidden sm:flex">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium transition-all">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        {currentTab.badge}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="relative bg-neutral-100 p-2 sm:p-3 overflow-hidden group">
                                <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-sm bg-white">
                                    <img 
                                        key={currentTab.id}
                                        src={currentTab.imgSrc} 
                                        alt={`Tampilan ${currentTab.label}`} 
                                        className="w-full h-auto object-cover object-top block animate-in fade-in duration-500" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* BANNER OPEN SOURCE */}
                        <div className="mx-auto mt-6">
                            <div className="bg-red-50/60 border border-red-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 font-bold text-lg">
                                        👥
                                    </div>
                                    <div>
                                        <h4 className="text-base font-semibold text-neutral-900">Kenapa Membatasi Akses ERP Hanya untuk Admin?</h4>
                                        <p className="text-sm text-neutral-600">
                                            Di ERPto, setiap karyawan mendapatkan akun untuk absensi, tugas harian, hingga laporan kerja. Seluruh kode sumber terbuka dan siap di-deploy di server Anda.
                                        </p>
                                    </div>
                                </div>
                                <a href="#get-started" className="shrink-0 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-full transition">
                                    Mulai Setup
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEKSI TECH STACK */}
            <section className="max-w-7xl mx-auto px-6 py-10 border-y border-neutral-100">
                <p className="text-center text-xs uppercase tracking-wider text-neutral-400 font-medium mb-6">
                    Dibangun dengan Arsitektur Modern & Teknologi Open-Source Teruji
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-75">
                    <span className="text-sm font-semibold tracking-tight text-neutral-700 flex items-center gap-1.5">
                        <Server className="text-red-500 size-5" /> Laravel Framework
                    </span>
                    <span className="text-sm font-semibold tracking-tight text-neutral-700 flex items-center gap-1.5">
                        <Code2 className="text-red-500 size-5" /> React & TypeScript
                    </span>
                    <span className="text-sm font-semibold tracking-tight text-neutral-700 flex items-center gap-1.5">
                        <Layers className="text-red-500 size-5" /> Inertia.js
                    </span>
                    <span className="text-sm font-semibold tracking-tight text-neutral-700 flex items-center gap-1.5">
                        <Cpu className="text-red-500 size-5" /> Tailwind CSS & Shadcn UI
                    </span>
                    <span className="text-sm font-semibold tracking-tight text-neutral-700 flex items-center gap-1.5">
                        <Database className="text-red-500 size-5" /> Multi-Tenant MySQL
                    </span>
                </div>
            </section>

            {/* GRID FITUR */}
            <section className="max-w-7xl mx-auto px-6 py-24" id="features">
                <div className="max-w-2xl mb-16">
                    <span className="text-xs font-semibold text-red-500 uppercase tracking-wider block mb-2">Kemampuan Utama</span>
                    <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-3">
                        Semua yang Anda butuhkan untuk mengatur skala bisnis.
                    </h2>
                    <p className="text-neutral-600 text-base">
                        Rangkaian modul terpadu yang dirancang untuk menggantikan aplikasi lama Anda yang terpisah-pisah, tanpa memperlambat kecepatan operasional harian.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { 
                            title: "Holding Multi-Perusahaan", 
                            icon: <Building className="size-5" />, 
                            desc: "Kelola seluruh lini bisnis Anda dalam satu platform terpadu dengan mudah.", 
                            detail: "Pindah Akses", 
                            sub: "Instan & Praktis" 
                        },
                        { 
                            title: "Kanban & Linimasa Proyek", 
                            icon: <Kanban className="size-5" />, 
                            desc: "Manajemen tugas lintas departemen dengan linimasa Gantt dan pemantauan progres tim secara langsung.", 
                            detail: "Otomasi Tenggat", 
                            sub: "Real-Time" 
                        },
                        { 
                            title: "Presensi Anti-Kecurangan", 
                            icon: <IdCard className="size-5" />, 
                            desc: "Pencatatan kehadiran akurat berbasis geofencing GPS untuk mencegah penggunaan lokasi palsu.", 
                            detail: "Akurasi Lokasi", 
                            sub: "Presisi Tinggi" 
                        },
                        { 
                            title: "Penerimaan Barang Pintar", 
                            icon: <Receipt className="size-5" />, 
                            desc: "Penerimaan barang otomatis dari Purchase Order dengan verifikasi kesesuaian data dan fisik.", 
                            detail: "Verifikasi Stok", 
                            sub: "3-Way Match" 
                        },
                        { 
                            title: "Manajemen Multi-Gudang", 
                            icon: <Warehouse className="size-5" />, 
                            desc: "Pembaruan stok master secara otomatis, bertambah saat pembelian dan berkurang saat penjualan.", 
                            detail: "Valuasi Stok", 
                            sub: "Otomatisasi Stok" 
                        },
                        { 
                            title: "Penjualan & Faktur", 
                            icon: <MonitorSmartphone className="size-5" />, 
                            desc: "Cetak faktur dalam 1 klik serta pantau riwayat dan status pembayaran secara otomatis.", 
                            detail: "Dokumen & PDF", 
                            sub: "1-Klik Cetak" 
                        },
                        { 
                            title: "Papan Skor Kinerja (KPI)", 
                            icon: <Trophy className="size-5" />, 
                            desc: "Pacu kinerja tim penjualan dengan perhitungan target otomatis dan peringkat karyawan yang selalu diperbarui.", 
                            detail: "Sinkronisasi Data", 
                            sub: "Real-Time" 
                        },
                        { 
                            title: "Otoritas Akses Dinamis", 
                            icon: <Shield className="size-5" />, 
                            desc: "Pembatasan hak akses yang mendalam per akun, dilengkapi dengan jejak audit (Audit Trail) yang aman.", 
                            detail: "Audit Log", 
                            sub: "RBAC Granular" 
                        },
                    ].map((mod, i) => (
                        <div key={i} className="p-6 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 shadow-sm transition hover:shadow-md flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-5 border border-red-100">
                                    {mod.icon}
                                </div>
                                <h3 className="text-base font-semibold text-neutral-900 mb-2">{i + 1}. {mod.title}</h3>
                                <p className="text-sm text-neutral-600 leading-relaxed">{mod.desc}</p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-mono text-neutral-500 flex items-center justify-between">
                                <span>{mod.detail}</span>
                                <span className="text-red-500 font-semibold">{mod.sub}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SEKSI OPEN SOURCE & LAYANAN KUSTOM */}
            <section className="max-w-7xl mx-auto px-6 py-20 bg-neutral-50/60 border-y border-neutral-200/80" id="get-started">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-xs font-semibold text-red-500 uppercase tracking-wider block mb-2">
                        Open Source & Layanan
                    </span>
                    <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-3">
                        Setup Mandiri atau Kustomisasi Sesuai Kebutuhan
                    </h2>
                    <p className="text-neutral-600 text-base">
                        Unduh dan jalankan langsung dari repository secara gratis, atau hubungi saya untuk bantuan instalasi dan pengembangan fitur khusus.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
                    
                    {/* OPSI 1: SELF-HOSTED / OPEN SOURCE */}
                    <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm flex flex-col justify-between hover:border-neutral-300 transition">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-neutral-900">Self-Hosted</h3>
                                <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-medium">
                                    MIT License
                                </span>
                            </div>
                            <p className="text-xs text-neutral-500 mb-6">
                                Cocok untuk developer atau tim IT yang ingin melakukan instalasi dan pengelolaan server secara mandiri.
                            </p>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-neutral-900">Gratis</span>
                                    <span className="text-xs text-neutral-500 font-medium">/ Selamanya</span>
                                </div>
                                <p className="text-[11px] text-emerald-600 font-medium mt-1">
                                    ✓ Kode sumber terbuka di repository publik
                                </p>
                            </div>

                            <hr className="border-neutral-100 my-6" />

                            <ul className="space-y-3.5 text-sm text-neutral-700 mb-8">
                                <li className="flex items-center gap-3 font-semibold text-neutral-900">
                                    <GitBranch className="size-4 text-red-500 shrink-0" />
                                    <span>Akses Penuh Kode Sumber (Repository)</span>
                                </li>
                                <li className="flex items-center gap-3 font-semibold text-neutral-900">
                                    <Server className="size-4 text-red-500 shrink-0" />
                                    <span>Deploy di Server / VPS Anda Sendiri</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="size-4 text-emerald-500 shrink-0 stroke-[3]" />
                                    <span>Seluruh Modul ERP & Multi-Tenant Lengkap</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="size-4 text-emerald-500 shrink-0 stroke-[3]" />
                                    <span>Bebas Modifikasi Sesuai Kebutuhan Internal</span>
                                </li>
                            </ul>
                        </div>

                        <a
                            href="https://github.com/Rayykoto/ERPto"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 px-4 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 font-medium text-sm text-center shadow-sm transition flex items-center justify-center gap-2"
                        >
                            Ambil di Repository <ArrowUpRight className="size-4" />
                        </a>
                    </div>

                    {/* OPSI 2: CUSTOM & MANAGED SETUP */}
                    <div className="rounded-3xl border-2 border-red-500 bg-white p-8 shadow-xl shadow-red-500/10 flex flex-col justify-between relative">
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-red-500 text-white text-xs font-semibold tracking-wide uppercase flex items-center gap-1">
                            <Sparkles className="size-3" /> Bantuan & Kustomisasi
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4 mt-2">
                                <h3 className="text-xl font-semibold text-neutral-900">Custom & Setup</h3>
                                <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">
                                    Sesuai Kebutuhan
                                </span>
                            </div>
                            <p className="text-xs text-neutral-500 mb-6">
                                Solusi terima beres untuk instalasi server, penyesuaian alur bisnis, maupun pengembangan modul baru.
                            </p>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-neutral-900">Hubungi Saya</span>
                                </div>
                                <p className="text-[11px] text-neutral-500 font-medium mt-1">
                                    Diskusikan kebutuhan setup atau fitur kustom Anda
                                </p>
                            </div>

                            <hr className="border-neutral-100 my-6" />

                            <ul className="space-y-3.5 text-sm text-neutral-700 mb-8">
                                <li className="flex items-center gap-3 font-semibold text-neutral-900">
                                    <Wrench className="size-4 text-red-500 shrink-0" />
                                    <span>Kustomisasi Fitur, Modul & Laporan Khusus</span>
                                </li>
                                <li className="flex items-center gap-3 font-semibold text-neutral-900">
                                    <Server className="size-4 text-red-500 shrink-0" />
                                    <span>Bantuan Instalasi & Konfigurasi Server</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="size-4 text-emerald-500 shrink-0 stroke-[3]" />
                                    <span>Integrasi API & Migrasi Data Awal</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="size-4 text-emerald-500 shrink-0 stroke-[3]" />
                                    <span>Dukungan Teknis & Maintenance Prioritas</span>
                                </li>
                            </ul>
                        </div>

                        <a
                            href="https://wa.me/6281314633490?text=Halo,%20saya%20tertarik%20untuk%20konsultasi%20setup%20/%20kustomisasi%20aplikasi%20ERPto"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 px-4 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium text-sm text-center shadow-md shadow-red-500/20 transition block"
                        >
                            Hubungi via WhatsApp
                        </a>
                    </div>

                </div>
            </section>

            {/* SEKSI ARSITEKTUR */}
            <section className="max-w-7xl mx-auto px-6 py-16" id="architecture">
                <div className="rounded-3xl border border-neutral-200 bg-neutral-50/50 p-8 sm:p-12 relative overflow-hidden">
                    <div className="max-w-2xl mb-8">
                        <span className="text-xs font-semibold text-red-500 uppercase tracking-wider block mb-2">Arsitektur Multi-Tenant</span>
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 mb-3">
                            Terisolasi Aman. Terintegrasi Sempurna.
                        </h2>
                        <p className="text-neutral-600 text-sm leading-relaxed">
                            Setiap cabang bisnis dan anak perusahaan Anda mendapatkan ruang data terisolasi secara penuh, diamankan dengan pembatasan akses berbasis peran dan pencatatan log aktivitas.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                            <span className="text-xs font-mono font-medium text-red-500 block mb-1">PUSAT HOLDING</span>
                            <h4 className="text-sm font-semibold text-neutral-900 mb-1">Perpindahan Workspace Instan</h4>
                            <p className="text-xs text-neutral-500">Beralih antar perusahaan atau anak cabang dalam satu akun tanpa perlu login ulang.</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                            <span className="text-xs font-mono font-medium text-red-500 block mb-1">ENTITAS ANAK</span>
                            <h4 className="text-sm font-semibold text-neutral-900 mb-1">Operasional Mandiri</h4>
                            <p className="text-xs text-neutral-500">Masing-masing cabang memiliki data produk, transaksi, dan struktur tim yang terpisah.</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                            <span className="text-xs font-mono font-medium text-red-500 block mb-1">SELF-HOSTED & WHITE-LABEL</span>
                            <h4 className="text-sm font-semibold text-neutral-900 mb-1">Domain Khusus</h4>
                            <p className="text-xs text-neutral-500">Jalankan di domain perusahaan Anda sendiri, misalnya: domain.com</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION BAWAH */}
            <section className="max-w-7xl mx-auto px-6 pb-24">
                <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-10 sm:p-16 text-center relative overflow-hidden">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-4">
                            Siap menyatukan seluruh operasional bisnis Anda?
                        </h2>
                        <p className="text-neutral-600 text-sm mb-8">
                            Mulai dengan mengunduh kode sumber <b>ERPto</b> secara gratis untuk di-deploy di server Anda sendiri, atau diskusikan kebutuhan kustomisasi khusus untuk perusahaan Anda.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <a 
                                href="https://github.com/Rayykoto/ERPto" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-900 text-sm font-semibold shadow-sm transition"
                            >
                                <GitBranch className="size-4" />
                                <span>Lihat Repository GitHub</span>
                            </a>
                            <a 
                                href="https://wa.me/6281314633490?text=Halo,%20saya%20tertarik%20untuk%20konsultasi%20setup%20/%20kustomisasi%20aplikasi%20ERPto" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-sm shadow-red-500/25 transition"
                            >
                                <span>Hubungi Kami di WhatsApp</span>
                                <ArrowRight className="size-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
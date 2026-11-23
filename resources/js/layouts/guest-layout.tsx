import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';

export default function GuestLayout({ children }: { children: ReactNode }) {
    return (
        <div className="bg-white text-neutral-900 selection:bg-red-500 selection:text-white relative overflow-x-hidden font-sans">
            
            {/* Subtle Top Atmospheric Warm Gradient Glow */}
            <div 
                className="absolute top-0 left-0 right-0 h-[650px] pointer-events-none -z-10" 
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.03) 45%, rgba(255, 255, 255, 0) 70%)' }}
            ></div>
            <div 
                className="absolute top-96 right-0 w-[500px] h-[600px] pointer-events-none -z-10"
                style={{ background: 'radial-gradient(circle at 100% 30%, rgba(239, 68, 68, 0.05) 0%, transparent 50%)' }}
            ></div>

            {/* Header / Navigation */}
            <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-neutral-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white shadow-sm shadow-red-500/30 group-hover:bg-red-600 transition-colors">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold text-lg tracking-tight text-neutral-900">ERPto</span>
                            {/* <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">v4.2</span> */}
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
                        <a href="#features" className="hover:text-neutral-900 transition-colors">Features</a>
                        <a href="#ecosystem" className="hover:text-neutral-900 transition-colors">Ecosystem</a>
                        <a href="#architecture" className="hover:text-neutral-900 transition-colors">Architecture</a>
                        <a href="#pricing" className="hover:text-neutral-900 transition-colors">Pricing</a>
                        <Link href="/docs" className="hover:text-neutral-900 transition-colors">Documentation</Link>
                    </nav>
                </div>
            </header>

            <main>{children}</main>

            {/* Footer */}
            <footer className="w-full border-t border-neutral-100 bg-white py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-500">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-red-500 flex items-center justify-center text-white">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="font-semibold text-neutral-900">ERPto</span>
                        <span className="text-neutral-300">|</span>
                        <span>&copy; {new Date().getFullYear()} PT ERP Koto</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#features" className="hover:text-neutral-900 transition">Features</a>
                        <Link href="/docs" className="hover:text-neutral-900 transition">Documentation</Link>
                        <Link href="/privacy" className="hover:text-neutral-900 transition">Privacy</Link>
                        <Link href="/security" className="hover:text-neutral-900 transition">Security</Link>
                        <Link href="/status" className="hover:text-neutral-900 transition">Status</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
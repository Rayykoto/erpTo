import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const { flash } = usePage<any>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success('Berhasil', {
                description: flash.success,
            });
        }
        
        if (flash?.error) {
            toast.error('Terjadi Kesalahan', {
                description: flash.error,
            });
        }
    }, [flash]);

    return (
        <>
            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppLayoutTemplate>
            
            <Toaster position="top-right" richColors />
        </>
    );
}
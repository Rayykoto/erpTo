import { usePage } from '@inertiajs/react';

export function usePermission() {
    const { auth } = usePage().props as any;
    
    const isSuperAdmin = auth?.user?.is_super_admin || false;
    const userPermissions: string[] = auth?.permissions || [];

    // Cek satu permission
    const hasPermission = (permission: string): boolean => {
        if (isSuperAdmin) return true;
        return userPermissions.includes(permission);
    };

    // Cek apakah punya SALAH SATU dari sekumpulan permission
    const hasAnyPermission = (permissions: string[]): boolean => {
        if (isSuperAdmin) return true;
        return permissions.some((perm) => userPermissions.includes(perm));
    };

    // Cek apakah punya SEMUA dari sekumpulan permission
    const hasAllPermissions = (permissions: string[]): boolean => {
        if (isSuperAdmin) return true;
        return permissions.every((perm) => userPermissions.includes(perm));
    };

    return { hasPermission, hasAnyPermission, hasAllPermissions, isSuperAdmin };
}
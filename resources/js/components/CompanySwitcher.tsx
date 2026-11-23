import { router, usePage } from '@inertiajs/react';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { Building2, ChevronsUpDown, Check } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function CompanySwitcher() {
    const { auth } = usePage().props as any;
    const tenants = auth?.tenants || [];
    const activeTenantId = auth?.active_tenant_id;

    // Jika user belum punya tenant sama sekali, sembunyikan switcher
    if (tenants.length === 0) return null;

    // Cari data perusahaan yang sedang aktif
    const activeTenant = tenants.find((t: any) => t.id === activeTenantId) || tenants[0];

    const handleSwitch = (tenantId: string) => {
        if (tenantId === activeTenantId) return; 
        
        router.post(route('tenant.switch'), {
            tenant_id: tenantId
        }, {
            preserveScroll: true
        });
    };

    // KOMPONEN UNTUK TAMPILAN PERUSAHAAN AKTIF (Dipisahkan agar rapi)
    const ActiveCompanyDisplay = () => (
        <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                {activeTenant?.logo ? (
                    <img 
                        src={`/storage/${activeTenant.logo}`} 
                        alt={activeTenant.name} 
                        className="h-full w-full object-cover" 
                    />
                ) : (
                    <Building2 className="size-4" />
                )}
            </div>
            <div className="flex flex-col items-start justify-center overflow-hidden">
                <span className="truncate font-semibold text-sm w-[120px] text-left">
                    {activeTenant?.name || 'Pilih Perusahaan'}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    {activeTenant?.id}
                </span>
            </div>
        </div>
    );

    // KONDISI 1: JIKA USER HANYA PUNYA 1 PERUSAHAAN
    // Tampilkan logonya, tapi JANGAN jadikan tombol dropdown
    if (tenants.length === 1) {
        return (
            <SidebarMenuButton size="lg" className="w-full justify-between pointer-events-none">
                <ActiveCompanyDisplay />
            </SidebarMenuButton>
        );
    }

    // KONDISI 2: JIKA USER PUNYA LEBIH DARI 1 PERUSAHAAN (Dropdown Normal)
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <ActiveCompanyDisplay />
                    <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="start" className="w-64" sideOffset={8}>
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                    Perusahaan Anda
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {tenants.map((tenant: any) => (
                    <DropdownMenuItem
                        key={tenant.id}
                        onClick={() => handleSwitch(tenant.id)}
                        className="flex items-center justify-between cursor-pointer p-2"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex aspect-square size-6 items-center justify-center rounded-md border bg-background overflow-hidden shrink-0">
                                {tenant.logo ? (
                                    <img 
                                        src={`/storage/${tenant.logo}`} 
                                        alt={tenant.name} 
                                        className="h-full w-full object-cover" 
                                    />
                                ) : (
                                    <Building2 className="size-3 text-muted-foreground" />
                                )}
                            </div>
                            <span className="truncate font-medium text-sm">
                                {tenant.name}
                            </span>
                        </div>
                        
                        {tenant.id === activeTenantId && (
                            <Check className="size-4 shrink-0 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
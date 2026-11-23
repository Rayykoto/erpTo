import { usePage } from '@inertiajs/react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { BoxIcon, Building, ChartArea, DollarSign, DoorOpen, HandshakeIcon, LayoutGrid, NotebookIcon, Settings, Truck, Users, Warehouse } from 'lucide-react';
import CompanySwitcher from './CompanySwitcher';

type DynamicNavItem = Omit<NavItem, 'items'> & {
    permission?: string;
    items?: DynamicNavItem[];
};

const rawMainNavItems: DynamicNavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid
    },
    {
        title: 'Tasks',
        url: route('tasks.index'),
        icon: NotebookIcon,
        permission: 'tasks.view'
    },
    {
        title: 'Attendance',
        url: route('attendances.index'),
        icon: DoorOpen,
        permission: 'attendances.view'
    },
    {
        title: 'Purchase Order',
        url: route('purchase-orders.index'),
        icon: BoxIcon,
        permission: 'purchase_orders.view'
    },
    {
        title: 'Good Receipts',
        url: route('goods-receipts.index'),
        icon: BoxIcon,
        permission: 'goods_receipts.view'
    },
    {
        title: 'Products',
        url: route('products.index'),
        icon: Warehouse,
        permission: 'products.view'
    },
    {
        title: 'Sales Order',
        url: route('sales-orders.index'),
        icon: HandshakeIcon,
        permission: 'sales_orders.view'
    },
    {
        title: 'Delivery',
        url: route('delivery-orders.index'),
        icon: Truck,
        permission: 'delivery_orders.view'
    },
    {
        title: 'Invoice',
        url: route('invoices.index'),
        icon: DollarSign,
        permission: 'invoices.view'
    },
    {
        title: 'Sales',
        url: '#',
        icon: ChartArea,
        isActive: false,
        permission: 'sales_visits.view',
        items: [
            {
                title: 'Dashboard Sales',
                url: route('sales.index'),
                permission: 'sales_visits.view'
            },
            {
                title: 'Master Sales',
                url: route('sales.targets.index'),
                permission: 'sales_visits.execute'
            },
            {
                title: 'Visit Sales',
                url: route('sales.visits.create'),
                permission: 'sales_visits.create'
            }
        ]
    },
    {
        title: 'User Management',
        url: '#',
        icon: Users,
        isActive: false, 
        items: [         
            {
                title: 'Roles',
                url: route('roles.index'),
                permission: 'roles.view',
            },
            {
                title: 'Employees',
                url: route('employee.index'),
                permission: 'employees.view',
            },
        ],
    },
];

const rawFooterNavItems: DynamicNavItem[] = [
    {
        title: 'Log Systems',
        url: route('system-logs.index'),
        icon: Settings,
        permission: 'system_logs.view',
    },
    {
        title: 'Company',
        url: route('tenant.create'),
        icon: Building,
        permission: 'tenants.create',
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as any;
    
    const isSuperAdmin = auth?.user?.is_super_admin || false;
    const userPermissions = auth?.permissions || [];

    const hasPermission = (permission?: string) => {
        if (!permission) return true; 
        if (isSuperAdmin) return true; 
        return userPermissions.includes(permission);
    };

    const filterMenu = (items: DynamicNavItem[]): NavItem[] => {
        return items
            .filter((item) => hasPermission(item.permission)) 
            .map((item) => {
                if (item.items) {
                    const filteredSubItems = filterMenu(item.items);
                    return { ...item, items: filteredSubItems } as NavItem;
                }
                return item as NavItem;
            })
            .filter((item) => !item.items || item.items.length > 0);
    };

    const mainNavItems = filterMenu(rawMainNavItems);
    const footerNavItems = filterMenu(rawFooterNavItems);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <CompanySwitcher /> 
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
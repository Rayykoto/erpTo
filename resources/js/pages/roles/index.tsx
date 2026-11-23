import { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Plus, Save, Key, Users, CheckCircle2, Search, Zap } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

const DEFAULT_ACTIONS = ['view', 'create', 'update', 'delete', 'approve', 'execute', 'print'];

export default function RolesIndex({ roles, permissions }: any) {
    const { isSuperAdmin } = usePermission();
    // 1. STATE MANAGEMENT
    const [searchTerm, setSearchTerm] = useState('');
    const [activeRole, setActiveRole] = useState<any>(roles.length > 0 ? roles[0] : null);
    const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
    
    // Form untuk membuat Role baru
    const { data: roleData, setData: setRoleData, post: postRole, processing: roleProcessing, reset: resetRole, errors: roleErrors } = useForm({
        name: ''
    });

    // Form untuk membuat Modul Permission baru
    const { data: permData, setData: setPermData, reset: resetPerm, processing: permProcessing } = useForm({
        module_name: '',
        actions: [...DEFAULT_ACTIONS],
        custom_actions: '',
    });

    // 2. MESIN MATRIKS DINAMIS CERDAS
    const rawModules = Array.from(new Set(permissions.map((p: any) => p.name.split('.')[0])));
    const rawActions = Array.from(new Set(permissions.map((p: any) => p.name.substring(p.name.indexOf('.') + 1))));
    
    // Filter modul berdasarkan Search Term (Bisa mencari nama modul ATAU nama aksinya)
    const filteredModules = (rawModules as string[]).filter(module => {
        if (searchTerm === '') return true;
        const searchLower = searchTerm.toLowerCase();
        
        // Cocok dengan nama modul?
        if (module.toLowerCase().includes(searchLower)) return true;
        
        // Cocok dengan salah satu aksinya?
        const modulePerms = permissions.filter((p: any) => p.name.startsWith(`${module}.`));
        return modulePerms.some((p: any) => p.name.toLowerCase().includes(searchLower));
    });

    // Mengurutkan aksi agar kolom tabel selalu konsisten
    const actions = (rawActions as string[]).sort((a, b) => {
        const indexA = DEFAULT_ACTIONS.indexOf(a);
        const indexB = DEFAULT_ACTIONS.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    // 3. EFEK SAMPING: Saat role dipilih, centang otomatis permission yang dimilikinya
    useEffect(() => {
        if (activeRole) {
            const rolePerms = activeRole.permissions.map((p: any) => p.name);
            setSelectedPerms(rolePerms);
        }
    }, [activeRole]);

    // 4. FUNGSI TOGGLE CHECKBOX & PENYIMPANAN
    const togglePermission = (permName: string) => {
        setSelectedPerms(prev => 
            prev.includes(permName) ? prev.filter(p => p !== permName) : [...prev, permName]
        );
    };

    const toggleModule = (moduleName: string) => {
        const modulePerms = permissions.filter((p: any) => p.name.startsWith(`${moduleName}.`)).map((p: any) => p.name);
        const allChecked = modulePerms.every((p: string) => selectedPerms.includes(p));

        if (allChecked) {
            setSelectedPerms(prev => prev.filter(p => !modulePerms.includes(p)));
        } else {
            setSelectedPerms(prev => [...new Set([...prev, ...modulePerms])]);
        }
    };

    const savePermissions = () => {
        if (!activeRole) return;
        router.post(route('roles.update-permissions', activeRole.id), {
            permissions: selectedPerms
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => alert('Hak akses berhasil diperbarui!')
        });
    };

    const createNewRole = (e: React.FormEvent) => {
        e.preventDefault();
        postRole(route('roles.store'), {
            preserveScroll: true,
            onSuccess: () => {
                resetRole();
            }
        });
    };

    const handleCreatePermission = (e: React.FormEvent) => {
        e.preventDefault();
        let finalActions = [...permData.actions];
        if (permData.custom_actions.trim() !== '') {
            const customArr = permData.custom_actions
                .split(',')
                .map((a) => a.trim().replace(/\s+/g, '_'))
                .filter((a) => a !== '');
            finalActions = [...finalActions, ...customArr];
        }

        router.post(route('permissions.store'), {
            module_name: permData.module_name,
            actions: finalActions
        }, {
            onSuccess: () => resetPerm('module_name', 'custom_actions'),
            preserveScroll: true
        });
    };

    return (
        <AppLayout>
            <Head title="Manajemen Akses (Role)" />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
                
                {/* HEADER & PENCARIAN GLOBAL */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <ShieldCheck className="size-7 text-primary" /> Kendali Hak Akses
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Kelola peran karyawan dan otomatisasi pembuatan otorisasi modul baru.
                        </p>
                    </div>

                    <div className="relative w-full md:w-80 shadow-sm rounded-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Cari fitur atau nama modul..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 border-slate-200"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* PANEL KIRI: TOOLBOX (Daftar Role, Buat Role, Generate Modul) */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        
                        {/* 1. KOTAK DAFTAR ROLE */}
                        <Card className="shadow-sm border-t-4 border-t-slate-800">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="size-5 text-slate-700" /> Daftar Jabatan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                                    {roles.map((role: any) => (
                                        <Button 
                                            key={role.id} 
                                            variant={activeRole?.id === role.id ? 'default' : 'outline'}
                                            className={`justify-start shadow-none ${activeRole?.id === role.id ? '' : 'hover:bg-slate-50'}`}
                                            onClick={() => setActiveRole(role)}
                                        >
                                            {role.name}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. KOTAK BUAT JABATAN BARU */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-[15px]">Tambah Role Baru</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={createNewRole} className="flex flex-col gap-3">
                                    <Input 
                                        placeholder="Misal: Supervisor" 
                                        value={roleData.name}
                                        onChange={e => setRoleData('name', e.target.value)}
                                        required
                                    />
                                    {roleErrors.name && <span className="text-xs text-rose-500">{roleErrors.name}</span>}
                                    <Button type="submit" disabled={roleProcessing} className="w-full gap-2 bg-slate-800 hover:bg-slate-700">
                                        <Plus className="size-4" /> Buat Role
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* 3. KOTAK GENERATE PERMISSION */}
                        {isSuperAdmin && (
                        <Card className="shadow-sm bg-emerald-50/50 border-emerald-100">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-[15px] flex items-center gap-1.5 text-emerald-800">
                                    <Zap className="size-4" /> Generate Modul Akses
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreatePermission} className="flex flex-col gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-emerald-700 uppercase">Nama Modul Dasar</label>
                                        <Input
                                            value={permData.module_name}
                                            onChange={(e) => setPermData('module_name', e.target.value)}
                                            placeholder="Misal: payroll"
                                            className="bg-white"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-emerald-700 uppercase">Aksi Kustom (Opsional)</label>
                                        <Input
                                            value={permData.custom_actions}
                                            onChange={(e) => setPermData('custom_actions', e.target.value)}
                                            placeholder="Misal: cetak, transfer"
                                            className="bg-white"
                                        />
                                    </div>
                                    <Button type="submit" variant="secondary" disabled={permProcessing} className="w-full text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                                        {permProcessing ? 'Memproses...' : 'Generate Izin Akses'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                        )}

                    </div>

                    {/* PANEL KANAN: MATRIKS PERMISSION */}
                    <div className="lg:col-span-3">
                        {activeRole ? (
                            <Card className="shadow-sm border-t-4 border-t-primary h-full">
                                <CardHeader className="pb-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                                            <Key className="size-5 text-primary" /> Matriks Otorisasi: {activeRole.name}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Centang fitur yang diizinkan untuk posisi ini. Perubahan harus disimpan.
                                        </CardDescription>
                                    </div>
                                    <Button onClick={savePermissions} className="gap-2 shrink-0 px-6">
                                        <Save className="size-4" /> Simpan Perubahan
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {filteredModules.length > 0 ? (
                                        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                                                    <tr>
                                                        <th className="p-4 min-w-[200px] border-r">Nama Modul</th>
                                                        {actions.map((action: string) => (
                                                            <th key={action} className="p-4 text-center capitalize w-24">
                                                                {action}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 bg-white">
                                                    {filteredModules.map((module: string) => {
                                                        const modulePerms = permissions.filter((p: any) => p.name.startsWith(`${module}.`)).map((p: any) => p.name);
                                                        const isAllChecked = modulePerms.length > 0 && modulePerms.every((p: string) => selectedPerms.includes(p));

                                                        return (
                                                            <tr key={module} className="hover:bg-slate-50/70 transition-colors">
                                                                
                                                                {/* KOLOM MODUL (Klik untuk Select All baris) */}
                                                                <td className="p-4 border-r font-medium text-slate-700 capitalize flex items-center gap-3">
                                                                    <Checkbox 
                                                                        checked={isAllChecked} 
                                                                        onCheckedChange={() => toggleModule(module)} 
                                                                        className="data-[state=checked]:bg-slate-700 data-[state=checked]:border-slate-700"
                                                                    />
                                                                    <span className="cursor-pointer font-bold" onClick={() => toggleModule(module)}>
                                                                        {module.replace(/_/g, ' ')}
                                                                    </span>
                                                                </td>

                                                                {/* KOLOM AKSI */}
                                                                {actions.map((action: string) => {
                                                                    const permName = `${module}.${action}`;
                                                                    const permExists = permissions.find((p: any) => p.name === permName);
                                                                    const isChecked = selectedPerms.includes(permName);

                                                                    // Highlight jika cocok dengan pencarian
                                                                    const isMatchSearch = searchTerm && action.toLowerCase().includes(searchTerm.toLowerCase());

                                                                    return (
                                                                        <td key={permName} className="p-4 text-center align-middle">
                                                                            {permExists ? (
                                                                                <Checkbox 
                                                                                    checked={isChecked}
                                                                                    onCheckedChange={() => togglePermission(permName)}
                                                                                    className={`mx-auto transition-all ${isChecked ? 'data-[state=checked]:bg-primary scale-110' : ''} ${isMatchSearch ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
                                                                                />
                                                                            ) : (
                                                                                <span className="text-slate-200 font-light block mx-auto">—</span>
                                                                            )}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                                            <Search className="size-8 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500">Tidak ada modul atau aksi yang cocok dengan "{searchTerm}"</p>
                                        </div>
                                    )}
                                    
                                    <div className="mt-5 flex items-start gap-2 text-sm text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <p>Centang kotak pada ujung kiri setiap baris untuk memberikan semua akses sekaligus pada modul tersebut. Jangan lupa klik <b>Simpan Perubahan</b> setelah selesai.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-500 gap-4">
                                <Users className="size-12 text-slate-300" />
                                <p>Silakan buat atau pilih Role di panel kiri untuk mengatur hak akses.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, History } from 'lucide-react';
import AddEmployeeCard from './partials/add-employee-card';
import ActiveEmployeesTable from './partials/active-employees-table';
import InactiveEmployeesTable from './partials/inactive-employees-table';
import EditEmployeeModal from './partials/edit-employee-table';
import ResignEmployeeModal from './partials/resign-employee.table';
import RehireEmployeeModal from './partials/rehire-employee-table';

export default function EmployeesIndex({ employees, inactiveEmployees = [], roles, divisions = [] }: any) {
    // State Manajemen Modal
    const [editingUser, setEditingUser] = useState<any>(null);
    const [resigningUser, setResigningUser] = useState<any>(null);
    const [rehiringUser, setRehiringUser] = useState<any>(null);

    return (
        <AppLayout>
            <Head title="Manajemen Karyawan" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <Users className="size-7 text-primary" /> Manajemen Karyawan
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Undang staf ke perusahaan, kelola jabatan, dan pantau riwayat alumni.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* KOLOM KIRI: FORM TAMBAH KARYAWAN */}
                    <div className="lg:col-span-1">
                        <AddEmployeeCard roles={roles} divisions={divisions} />
                    </div>

                    {/* KOLOM KANAN: TABEL KARYAWAN */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="active" className="w-full h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <TabsList className="grid w-full sm:w-[400px] grid-cols-2 bg-slate-100 p-1">
                                    <TabsTrigger value="active" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary">
                                        <UserCheck className="size-4" /> Staf Aktif
                                    </TabsTrigger>
                                    <TabsTrigger value="alumni" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-800">
                                        <History className="size-4" /> Alumni (Nonaktif)
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="active" className="flex-1 mt-0">
                                <ActiveEmployeesTable 
                                    employees={employees} 
                                    onEdit={setEditingUser} 
                                    onResign={setResigningUser} 
                                />
                            </TabsContent>

                            <TabsContent value="alumni" className="flex-1 mt-0">
                                <InactiveEmployeesTable 
                                    inactiveEmployees={inactiveEmployees} 
                                    onRehire={setRehiringUser} 
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <EditEmployeeModal user={editingUser} isOpen={editingUser !== null} onClose={() => setEditingUser(null)} roles={roles} divisions={divisions} />
            <ResignEmployeeModal user={resigningUser} isOpen={resigningUser !== null} onClose={() => setResigningUser(null)} />
            <RehireEmployeeModal user={rehiringUser} isOpen={rehiringUser !== null} onClose={() => setRehiringUser(null)} roles={roles} divisions={divisions} />
        </AppLayout>
    );
}
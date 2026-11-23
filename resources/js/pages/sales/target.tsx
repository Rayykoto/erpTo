import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Target } from 'lucide-react';
import { toast } from 'sonner';
import TargetHeaderAndTable from './partials/target-header-table';
import TargetModal from './partials/target-modal';

export default function TargetManagement({ salesData, currentMonth }: any) {
    const userTargets = salesData?.data || salesData || [];

    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        user_id: '',
        month_year: currentMonth,
        target_amount: ''
    });

    // Navigasi Bulan (Filter)
    const handleMonthChange = (offset: number) => {
        const date = new Date(currentMonth + '-01');
        date.setMonth(date.getMonth() + offset);
        const newMonth = date.toISOString().slice(0, 7); // Format YYYY-MM
        router.get(route('sales.targets.index'), { month: newMonth }, { preserveState: true });
    };

    // Buka Modal
    const openTargetModal = (user: any) => {
        setSelectedUser(user);
        setData({
            user_id: user.user_id.toString(),
            month_year: currentMonth,
            target_amount: user.target_amount > 0 ? user.target_amount.toString() : ''
        });
    };

    // Tutup Modal
    const closeTargetModal = () => {
        setSelectedUser(null);
        reset();
    };

    // Submit Form
    const submitTarget = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('sales.targets.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeTargetModal();
                // Toast sukses otomatis ditangani AppLayout (flash message)
            },
            onError: () => {
                toast.error("Gagal Menyimpan", {
                    description: "Periksa kembali nominal target Anda."
                });
            }
        });
    };

    const monthDisplay = new Date(currentMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    return (
        <AppLayout>
            <Head title="Manajemen Target Sales" />
            
            <div className="flex flex-col gap-6 p-6 max-w-[1200px] mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-slate-800">
                            <Target className="size-8 text-blue-600" /> Manajemen Target
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">Tetapkan Key Performance Indicator (KPI) untuk tim lapangan.</p>
                    </div>
                </div>

                {/* TABEL DATA & KONTROL BULAN */}
                <TargetHeaderAndTable 
                    userTargets={userTargets} 
                    currentMonth={currentMonth}
                    monthDisplay={monthDisplay}
                    handleMonthChange={handleMonthChange}
                    openTargetModal={openTargetModal}
                />
            </div>

            {/* MODAL PENGATURAN */}
            <TargetModal 
                selectedUser={selectedUser}
                monthDisplay={monthDisplay}
                data={data}
                setData={setData}
                submitTarget={submitTarget}
                closeTargetModal={closeTargetModal}
                processing={processing}
            />
        </AppLayout>
    );
}
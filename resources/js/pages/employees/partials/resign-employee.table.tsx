import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function ResignEmployeeModal({ user, isOpen, onClose }: any) {
    const submit = () => {
        if (user) {
            router.delete(route('employee.destroy', user.id), {
                onSuccess: () => onClose(),
                preserveScroll: true,
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md border-rose-200">
                <DialogHeader>
                    <DialogTitle className="text-rose-600 flex items-center gap-2">
                        <ShieldAlert className="size-5" /> Konfirmasi Pemberhentian
                    </DialogTitle>
                    <DialogDescription>Apakah Anda yakin ingin memberhentikan <b>{user?.name}</b>?</DialogDescription>
                </DialogHeader>
                <div className="bg-rose-50 p-3 rounded-md border border-rose-100 text-sm text-rose-800 mt-2">
                    <ul className="list-disc list-inside space-y-1">
                        <li>Dipindahkan ke tab <b>Alumni</b>.</li>
                        <li>Akses masuk ke perusahaan ini akan dicabut.</li>
                    </ul>
                </div>
                <DialogFooter className="mt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                    <Button type="button" variant="destructive" onClick={submit}>Ya, Nonaktifkan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
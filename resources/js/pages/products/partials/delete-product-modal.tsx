import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function DeleteProductModal({ product, onClose }: { product: any; onClose: () => void }) {
    const submit = () => {
        if (!product) return;
        router.delete(route('products.destroy', product.id), {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={product !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md border-rose-200">
                <DialogHeader>
                    <DialogTitle className="text-rose-600 flex items-center gap-2">
                        <AlertTriangle className="size-5" /> Hapus Master Produk
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 mt-2">
                        Anda akan menghapus barang <b>{product?.name} ({product?.sku})</b>.
                    </DialogDescription>
                </DialogHeader>
                <div className="bg-rose-50 p-3 rounded-md border border-rose-100 text-sm text-rose-800 mt-2">
                    Tindakan ini tidak dapat dibatalkan. Jika produk ini pernah dikirim menggunakan Surat Jalan (DO), penghapusan akan <b>ditolak oleh sistem</b> demi menjaga keamanan Kartu Stok.
                </div>
                <DialogFooter className="mt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                    <Button type="button" variant="destructive" onClick={submit}>Ya, Hapus Permanen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
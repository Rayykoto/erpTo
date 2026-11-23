import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AddProductModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        sku: '',
        name: '',
        price: '',
        stock: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('products.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Tambahkan Produk Baru</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Kode SKU</label>
                            <Input value={data.sku} onChange={e => setData('sku', e.target.value.toUpperCase())} placeholder="Misal: BRG-001" required />
                            {errors.sku && <span className="text-xs text-rose-500">{errors.sku}</span>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Stok Awal</label>
                            <Input type="number" min="0" value={data.stock} onChange={e => setData('stock', e.target.value)} placeholder="0" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nama Lengkap Produk</label>
                        <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Misal: Video Wall" required />
                        {errors.name && <span className="text-xs text-rose-500">{errors.name}</span>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Harga Jual Dasar (Rp)</label>
                        <Input type="number" min="0" value={data.price} onChange={e => setData('price', e.target.value)} placeholder="50000" required />
                        {errors.price && <span className="text-xs text-rose-500">{errors.price}</span>}
                    </div>
                    
                    <div className="bg-slate-50 text-xs text-slate-500 p-3 rounded border">
                        Catatan: Untuk menambah/mengurangi stok di kemudian hari, Anda harus menggunakan sistem Surat Jalan (DO) atau Penyesuaian Stok demi menjaga histori rekam jejak.
                    </div>

                    <DialogFooter className="mt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing}>Simpan Produk</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function EditProductModal({ product, onClose }: { product: any; onClose: () => void }) {
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        sku: '',
        name: '',
        price: '',
    });

    useEffect(() => {
        if (product) {
            setData({ sku: product.sku, name: product.name, price: product.price });
            clearErrors();
        } else {
            reset();
        }
    }, [product]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;
        put(route('products.update', product.id), {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={product !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Informasi Produk</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4 mt-2">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Kode SKU</label>
                        <Input value={data.sku} onChange={e => setData('sku', e.target.value.toUpperCase())} required />
                        {errors.sku && <span className="text-xs text-rose-500">{errors.sku}</span>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nama Lengkap Produk</label>
                        <Input value={data.name} onChange={e => setData('name', e.target.value)} required />
                        {errors.name && <span className="text-xs text-rose-500">{errors.name}</span>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Harga Jual Dasar (Rp)</label>
                        <Input type="number" min="0" value={data.price} onChange={e => setData('price', e.target.value)} required />
                        {errors.price && <span className="text-xs text-rose-500">{errors.price}</span>}
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
import { 
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function TargetModal({ 
    selectedUser, 
    monthDisplay, 
    data, 
    setData, 
    submitTarget, 
    closeTargetModal, 
    processing 
}: any) {
    return (
        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && closeTargetModal()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submitTarget}>
                    <DialogHeader>
                        <DialogTitle>Tetapkan Target Sales</DialogTitle>
                        <DialogDescription>
                            Atur target bulanan untuk <b className="text-slate-800 font-semibold">{selectedUser?.name}</b> pada bulan <b className="text-slate-800 font-semibold">{monthDisplay}</b>.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="target" className="font-semibold text-slate-700">Target Penjualan (Rp)</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-slate-400 sm:text-sm font-medium">Rp</span>
                                </div>
                                <Input
                                    id="target"
                                    type="number"
                                    min="0"
                                    className="pl-9 font-mono font-medium text-lg h-12 shadow-sm"
                                    placeholder="Cth: 50000000"
                                    value={data.target_amount}
                                    onChange={(e) => setData('target_amount', e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">Masukkan angka tanpa titik (Contoh: 50000000 untuk 50 Juta).</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeTargetModal} className="border-slate-300">
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing || !data.target_amount} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {processing ? (
                                <><Loader2 className="size-4 mr-2 animate-spin" /> Menyimpan...</>
                            ) : (
                                'Simpan Target'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
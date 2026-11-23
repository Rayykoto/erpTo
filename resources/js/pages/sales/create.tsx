import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MapPin, Camera, Save, Loader2, User, Phone, Mail } from 'lucide-react';

export default function SalesVisitCreate() {
    const { data, setData, post, processing, reset, errors } = useForm({
        client_name: '',
        email: '',
        phone: '',
        latitude: '',
        longitude: '',
        photo: null as File | null,
    });

    const [isLocating, setIsLocating] = useState(false);
    const [locationSuccess, setLocationSuccess] = useState(false);

    // Fungsi untuk mengambil titik kordinat
    const handleGetLocation = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setData(currentData => ({
                        ...currentData,
                        latitude: position.coords.latitude.toString(),
                        longitude: position.coords.longitude.toString()
                    }));
                    setLocationSuccess(true);
                    setIsLocating(false);
                    
                    toast.success("Lokasi Ditemukan", {
                        description: "Koordinat GPS berhasil disimpan.",
                    });
                },
                () => {
                    setIsLocating(false);
                    toast.error("Gagal mendapatkan lokasi", {
                        description: "Pastikan izin GPS/Lokasi aktif di browser Anda.",
                    });
                }
            );
        } else {
            setIsLocating(false);
            toast.error("Tidak Didukung", {
                description: "Browser Anda tidak mendukung fitur Geolocation.",
            });
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('sales.visits.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setLocationSuccess(false);
            },
            onError: () => {
                toast.error("Gagal Menyimpan", {
                    description: "Silakan periksa kembali isian form Anda.",
                });
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Check-in Kunjungan" />
            
            <div className="flex flex-col p-4 sm:p-6 max-w-md mx-auto w-full">
                
                <Card className="shadow-lg border-t-4 border-t-blue-600">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl">Laporan Kunjungan</CardTitle>
                        <CardDescription>Catat prospek door-to-door Anda di sini.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-5">
                            
                            {/* DATA WAJIB */}
                            <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                <div className="space-y-1.5">
                                    <Label htmlFor="client_name" className="text-blue-900 font-semibold flex items-center gap-2">
                                        <User className="size-4" /> Nama Perusahaan / PIC <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        id="client_name" 
                                        placeholder="Cth: PT Maju Jaya / Bpk. Andi" 
                                        value={data.client_name}
                                        onChange={e => setData('client_name', e.target.value)}
                                        className="bg-white"
                                        autoFocus
                                    />
                                    {errors.client_name && <p className="text-red-500 text-xs">{errors.client_name}</p>}
                                </div>
                            </div>

                            {/* DATA OPSIONAL */}
                            <div className="space-y-4">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Info Kontak (Opsional)</Label>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1.5 flex flex-col relative">
                                        <Phone className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
                                        <Input 
                                            id="phone" 
                                            placeholder="No. HP / WhatsApp" 
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className="pl-9"
                                            type="tel"
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col relative">
                                        <Mail className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
                                        <Input 
                                            id="email" 
                                            placeholder="Email PIC" 
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="pl-9"
                                            type="email"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="my-2" />

                            <div className="space-y-4">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lampiran Lapangan (Opsional)</Label>
                                
                                <div className="flex gap-2">
                                    {/* Tombol Geolocation */}
                                    <Button 
                                        type="button" 
                                        variant={locationSuccess ? "default" : "outline"}
                                        className={`flex-1 flex flex-col h-auto py-3 gap-1 ${locationSuccess ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                                        onClick={handleGetLocation}
                                        disabled={isLocating}
                                    >
                                        {isLocating ? <Loader2 className="size-5 animate-spin" /> : <MapPin className="size-5" />}
                                        <span className="text-[10px] leading-tight">
                                            {locationSuccess ? 'Lokasi Tersimpan' : 'Ambil Koordinat'}
                                        </span>
                                    </Button>

                                    {/* Tombol Upload/Kamera */}
                                    <div className="flex-1 relative">
                                        <Button 
                                            type="button" 
                                            variant={data.photo ? "default" : "outline"}
                                            className="w-full flex flex-col h-auto py-3 gap-1 relative overflow-hidden pointer-events-none"
                                        >
                                            <Camera className="size-5" />
                                            <span className="text-[10px] leading-tight text-center">
                                                {data.photo ? 'Foto Terpilih' : 'Jepret Foto'}
                                            </span>
                                        </Button>
                                        {/* Input File asli ditumpuk transparan di atas tombol */}
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            capture="environment" 
                                            onChange={e => setData('photo', e.target.files ? e.target.files[0] : null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* TOMBOL SAVE */}
                            <Button 
                                type="submit" 
                                size="lg" 
                                className="w-full mt-4 h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white" 
                                disabled={processing || !data.client_name}
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2"><Loader2 className="size-5 animate-spin" /> Menyimpan...</span>
                                ) : (
                                    <span className="flex items-center gap-2"><Save className="size-5" /> Simpan & Dapatkan Poin</span>
                                )}
                            </Button>
                            
                        </form>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
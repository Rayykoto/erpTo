import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Settings, UploadCloud, Eye } from 'lucide-react';
import { useState } from 'react';

export default function InvoiceTemplateSettings({ settings }: any) {
    const { data, setData, post, processing } = useForm({
        company_name: settings.company_name || '',
        company_address: settings.company_address || '',
        company_phone: settings.company_phone || '',
        theme_color: settings.theme_color || '#2563eb',
        invoice_footer: settings.invoice_footer || '',
        logo: null as File | null,
    });

    const [previewLogo, setPreviewLogo] = useState<string | null>(
        settings.logo_path ? `/storage/${settings.logo_path}` : null
    );

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            // Buat URL sementara untuk Live Preview
            setPreviewLogo(URL.createObjectURL(file));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.invoice.update'), {
            forceFormData: true, // Wajib untuk upload file
            preserveScroll: true
        });
    };

    return (
        <AppLayout>
            <Head title="Pengaturan Template Invoice" />
            
            <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Settings className="size-8 text-primary" /> Kustomisasi Faktur
                    </h1>
                    <p className="text-muted-foreground mt-1">Atur identitas merek (branding) perusahaan untuk cetakan invoice Anda.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    
                    {/* KOLOM KIRI: FORM PENGATURAN */}
                    <Card className="shadow-sm">
                        <CardHeader className="border-b">
                            <CardTitle>Identitas Perusahaan</CardTitle>
                            <CardDescription>Detail ini akan tercetak di bagian atas dan bawah faktur.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={submit} className="flex flex-col gap-5">
                                {/* Upload Logo */}
                                <div className="space-y-2">
                                    <Label>Logo Perusahaan</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="size-16 rounded-md border flex items-center justify-center bg-muted/30 overflow-hidden">
                                            {previewLogo ? (
                                                <img src={previewLogo} alt="Logo" className="w-full h-full object-contain" />
                                            ) : (
                                                <UploadCloud className="size-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <Input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="w-full max-w-xs"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Format yang didukung: JPG, PNG. Maksimal 2MB.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Nama Perusahaan</Label>
                                    <Input value={data.company_name} onChange={e => setData('company_name', e.target.value)} placeholder="PT Contoh Makmur" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Alamat Lengkap</Label>
                                    <Textarea value={data.company_address} onChange={e => setData('company_address', e.target.value)} placeholder="Jl. Sudirman No. 123..." className="resize-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nomor Telepon</Label>
                                        <Input value={data.company_phone} onChange={e => setData('company_phone', e.target.value)} placeholder="021-..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Warna Tema (Aksen)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input type="color" value={data.theme_color} onChange={e => setData('theme_color', e.target.value)} className="w-14 h-10 p-1 cursor-pointer" />
                                            <Input type="text" value={data.theme_color} onChange={e => setData('theme_color', e.target.value)} className="font-mono uppercase" />
                                        </div>
                                    </div>
                                </div>

                                <hr className="my-2" />

                                <div className="space-y-2">
                                    <Label>Catatan Kaki / Info Pembayaran (Terms)</Label>
                                    <Textarea 
                                        value={data.invoice_footer} 
                                        onChange={e => setData('invoice_footer', e.target.value)} 
                                        placeholder="Mohon transfer pembayaran ke rekening BCA 12345678 a.n PT Contoh Makmur sebelum jatuh tempo." 
                                        className="min-h-[100px]" 
                                    />
                                </div>

                                <Button type="submit" disabled={processing} className="w-full mt-4">
                                    <Save className="size-4 mr-2" /> {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* KOLOM KANAN: LIVE PREVIEW INVOICE */}
                    <div className="sticky top-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-muted-foreground">
                            <Eye className="size-5" /> Live Preview
                        </h3>
                        
                        {/* Kertas Invoice Simulasi */}
                        <div 
                            className="bg-white rounded-lg shadow-lg overflow-hidden border border-muted transition-colors duration-300 relative"
                            style={{ borderTop: `8px solid ${data.theme_color}` }}
                        >
                            <div className="p-8 pb-12">
                                {/* Kop Surat */}
                                <div className="flex justify-between items-start border-b pb-6">
                                    <div className="flex flex-col gap-2 max-w-[200px]">
                                        {previewLogo ? (
                                            <img src={previewLogo} alt="Logo" className="h-12 object-contain object-left" />
                                        ) : (
                                            <div className="h-12 bg-muted/30 rounded flex items-center px-4 text-xs text-muted-foreground border border-dashed">Area Logo</div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-2xl font-bold uppercase tracking-wider" style={{ color: data.theme_color }}>INVOICE</h2>
                                        <p className="text-sm font-medium mt-1 text-slate-800">{data.company_name || 'Nama Perusahaan'}</p>
                                        <p className="text-xs text-slate-500 mt-1 whitespace-pre-wrap leading-relaxed max-w-[200px] ml-auto">
                                            {data.company_address || 'Alamat perusahaan akan tampil di sini.'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">{data.company_phone || 'Telp: -'}</p>
                                    </div>
                                </div>

                                {/* Body Simulasi */}
                                <div className="mt-8 flex justify-between">
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold mb-1">Ditagihkan Kepada:</p>
                                        <p className="text-sm font-bold text-slate-800">PT Pelanggan Simulasi</p>
                                        <p className="text-xs text-slate-500 mt-1">Jl. Contoh Klien No. 99</p>
                                    </div>
                                    <div className="text-right text-sm">
                                        <p><span className="text-slate-500 mr-2">No. Faktur:</span> <span className="font-semibold">INV-2609-001</span></p>
                                        <p className="mt-1"><span className="text-slate-500 mr-2">Tanggal:</span> <span className="font-semibold">22 Sep 2026</span></p>
                                    </div>
                                </div>

                                {/* Tabel Simulasi */}
                                <div className="mt-8 border-t border-b py-2">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-slate-500 border-b">
                                                <th className="text-left py-2">Deskripsi Barang</th>
                                                <th className="text-right py-2">Jumlah</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="py-3 text-slate-800">Paket ERP Premium</td>
                                                <td className="py-3 text-right font-mono text-slate-800">Rp 15.000.000</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer / Term Simulasi */}
                                <div className="mt-8">
                                    <p className="text-xs font-semibold text-slate-800 mb-1" style={{ color: data.theme_color }}>Info Pembayaran & Catatan:</p>
                                    <p className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed">
                                        {data.invoice_footer || 'Catatan kaki invoice atau detail rekening bank akan tampil di sini.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
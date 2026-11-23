import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';

export default function InvoicePrintBulk({ invoices = [], settings }: any) {
    const formatRp = (angka: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(angka || 0);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const themeColor = settings?.theme_color || '#2563eb';

    return (
        <>
            <Head title={`Cetak Massal Faktur (${invoices.length} Dokumen)`} />

            {/* PANEL KONTROL ATAS (Hilang saat dicetak) */}
            <div className="print:hidden bg-slate-900 text-white py-4 px-6 flex justify-between items-center shadow-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.close()}
                        className="text-black border-slate-700 hover:bg-slate-200"
                    >
                        <ArrowLeft className="size-4 mr-2" /> Tutup
                    </Button>
                    <span className="text-sm text-slate-300">
                        Pratinjau Cetak Massal ({invoices.length} Faktur)
                    </span>
                </div>
                <Button
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                    <Printer className="size-4" /> Cetak Semua ({invoices.length})
                </Button>
            </div>

            {/* DAFTAR LEMBAR KERTAS A4 INVOICE */}
            <div className="py-8 print:py-0 space-y-8 print:space-y-0 bg-slate-100 print:bg-white">
                {invoices.map((invoice: any, docIndex: number) => {
                    const isLast = docIndex === invoices.length - 1;

                    return (
                        <div
                            key={invoice.id}
                            className={`max-w-[800px] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none overflow-hidden rounded-lg print:rounded-none ${
                                !isLast ? 'print:break-after-page' : ''
                            }`}
                        >
                            {/* Garis Aksen Warna Tema */}
                            <div style={{ height: '8px', backgroundColor: themeColor }} />

                            <div className="p-10 md:p-14 print:p-6">
                                {/* KOP SURAT */}
                                <div className="flex justify-between items-start border-b pb-8">
                                    <div>
                                        {settings?.logo_path ? (
                                            <img
                                                src={`/storage/${settings.logo_path}`}
                                                alt="Logo"
                                                className="h-14 object-contain object-left mb-3"
                                            />
                                        ) : (
                                            <div
                                                className="text-xl font-bold uppercase tracking-wider mb-2"
                                                style={{ color: themeColor }}
                                            >
                                                {settings?.company_name || 'Perusahaan'}
                                            </div>
                                        )}
                                        <p className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed max-w-[280px]">
                                            {settings?.company_address || ''}
                                        </p>
                                        {settings?.company_phone && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                Telp: {settings.company_phone}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <h1
                                            className="text-3xl font-extrabold uppercase tracking-widest"
                                            style={{ color: themeColor }}
                                        >
                                            FAKTUR
                                        </h1>
                                        <p className="text-sm font-bold text-slate-800 mt-1">
                                            {invoice.invoice_number}
                                        </p>
                                        <div className="mt-4 text-xs space-y-1 text-slate-600">
                                            <p>
                                                <span className="text-slate-400 mr-2">Tanggal Terbit:</span>
                                                <span className="font-medium">
                                                    {formatDate(invoice.issue_date)}
                                                </span>
                                            </p>
                                            <p>
                                                <span className="text-slate-400 mr-2">Jatuh Tempo:</span>
                                                <span className="font-medium">
                                                    {formatDate(invoice.due_date)}
                                                </span>
                                            </p>
                                            <p>
                                                <span className="text-slate-400 mr-2">Status:</span>
                                                <span
                                                    className={`font-bold uppercase ${
                                                        invoice.status === 'paid'
                                                            ? 'text-green-600'
                                                            : 'text-orange-600'
                                                    }`}
                                                >
                                                    {invoice.status === 'paid'
                                                        ? 'LUNAS'
                                                        : invoice.status === 'partial'
                                                          ? 'CICILAN / SEBAGIAN'
                                                          : 'BELUM LUNAS'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* INFORMASI KLIEN & REFERENSI */}
                                <div className="my-8 flex justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                            Ditagihkan Kepada:
                                        </p>
                                        <h3 className="text-lg font-bold text-slate-800">
                                            {invoice.client_name}
                                        </h3>
                                    </div>

                                    <div className="text-right space-y-1">
                                        {invoice.sales_person && (
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                                                    Sales Penanggung Jawab:
                                                </p>
                                                <p className="text-sm font-medium text-slate-800">
                                                    {invoice.sales_person.name}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* TABEL RINCIAN ITEM */}
                                <div className="my-6">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr
                                                className="text-white border-b"
                                                style={{ backgroundColor: themeColor }}
                                            >
                                                <th className="text-left py-3 px-4 font-semibold rounded-l-md">
                                                    Deskripsi Barang / Jasa
                                                </th>
                                                <th className="text-center py-3 px-4 font-semibold w-24">
                                                    Jumlah
                                                </th>
                                                <th className="text-right py-3 px-4 font-semibold w-36">
                                                    Harga Satuan
                                                </th>
                                                <th className="text-right py-3 px-4 font-semibold w-36 rounded-r-md">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {invoice.items?.map((item: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-slate-50">
                                                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                                                        {item.item_name}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center text-slate-600">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                                                        {formatRp(item.unit_price)}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                                                        {formatRp(item.total_price)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* BAGIAN TOTAL */}
                                <div className="flex justify-end mt-6">
                                    <div className="w-72 space-y-2 text-sm">
                                        <div className="flex justify-between text-slate-600 py-1">
                                            <span>Subtotal:</span>
                                            <span className="font-mono">{formatRp(invoice.subtotal)}</span>
                                        </div>
                                        {invoice.tax_amount > 0 && (
                                            <div className="flex justify-between text-slate-600 py-1 border-b">
                                                <span>PPN (11%):</span>
                                                <span className="font-mono">
                                                    {formatRp(invoice.tax_amount)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-base font-bold text-slate-900 pt-2 border-t-2 border-slate-800">
                                            <span>Grand Total:</span>
                                            <span
                                                className="font-mono text-lg"
                                                style={{ color: themeColor }}
                                            >
                                                {formatRp(invoice.grand_total)}
                                            </span>
                                        </div>
                                        {invoice.status === 'partial' && invoice.balance_due > 0 && (
                                            <div className="flex justify-between text-xs font-semibold text-red-600 pt-1">
                                                <span>Sisa Tagihan:</span>
                                                <span className="font-mono">
                                                    {formatRp(invoice.balance_due)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* CATATAN KAKI / REKENING */}
                                {settings?.invoice_footer && (
                                    <div className="mt-16 pt-6 border-t border-slate-200">
                                        <p
                                            className="text-xs font-bold uppercase tracking-wider mb-1"
                                            style={{ color: themeColor }}
                                        >
                                            Catatan & Instruksi Pembayaran:
                                        </p>
                                        <p className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed">
                                            {settings.invoice_footer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        @media print {
                            body {
                                background: white !important;
                            }
                            @page {
                                margin: 0.4in;
                                size: A4;
                            }
                        }
                    `,
                }}
            />
        </>
    );
}
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';

export default function DeliveryOrderPrintBulk({ deliveryOrders = [], settings }: any) {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const themeColor = settings?.theme_color || '#0f172a';

    return (
        <>
            <Head title={`Cetak Massal Surat Jalan (${deliveryOrders.length} Dokumen)`} />

            {/* PANEL KONTROL CETAK */}
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
                        Pratinjau Cetak Massal ({deliveryOrders.length} Surat Jalan)
                    </span>
                </div>
                <Button
                    onClick={() => window.print()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                >
                    <Printer className="size-4" /> Cetak Semua ({deliveryOrders.length})
                </Button>
            </div>

            {/* DAFTAR LEMBAR KERTAS A4 */}
            <div className="py-8 print:py-0 space-y-8 print:space-y-0 bg-slate-100 print:bg-white">
                {deliveryOrders.map((deliveryOrder: any, docIndex: number) => {
                    const isLast = docIndex === deliveryOrders.length - 1;

                    return (
                        <div
                            key={deliveryOrder.id}
                            className={`max-w-[800px] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none overflow-hidden ${
                                !isLast ? 'print:break-after-page' : ''
                            }`}
                        >
                            <div className="p-10 md:p-14 print:p-6">
                                {/* KOP SURAT */}
                                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
                                    <div>
                                        {settings?.logo_path ? (
                                            <img
                                                src={`/storage/${settings.logo_path}`}
                                                alt="Logo Perusahaan"
                                                className="h-12 object-contain object-left mb-2"
                                            />
                                        ) : (
                                            <div
                                                className="text-xl font-bold uppercase tracking-wider mb-1"
                                                style={{ color: themeColor }}
                                            >
                                                {settings?.company_name || 'Perusahaan Anda'}
                                            </div>
                                        )}
                                        <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed max-w-[280px]">
                                            {settings?.company_address ||
                                                'Alamat belum diatur pada Pengaturan Template.'}
                                        </p>
                                        {settings?.company_phone && (
                                            <p className="text-xs text-slate-600 mt-1">
                                                Telp: {settings.company_phone}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <h1 className="text-3xl font-extrabold uppercase tracking-widest text-slate-900">
                                            SURAT JALAN
                                        </h1>
                                        <p className="text-sm font-bold text-slate-700 mt-1">
                                            {deliveryOrder.do_number}
                                        </p>
                                    </div>
                                </div>

                                {/* INFO PENGIRIMAN & PENERIMA */}
                                <div className="flex justify-between mb-8">
                                    <div className="w-1/2 pr-4">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Tujuan Pengiriman (Penerima):
                                        </p>
                                        <h3 className="text-base font-bold text-slate-800">
                                            {deliveryOrder.client_name}
                                        </h3>
                                        <div className="mt-4 text-xs text-slate-700 space-y-1 border border-slate-200 p-3 rounded bg-slate-50">
                                            <p>
                                                <span className="font-semibold w-24 inline-block">
                                                    Tanggal Kirim
                                                </span>
                                                : {formatDate(deliveryOrder.delivery_date)}
                                            </p>
                                            <p>
                                                <span className="font-semibold w-24 inline-block">
                                                    Nama Supir
                                                </span>
                                                : {deliveryOrder.driver_name || '-'}
                                            </p>
                                            <p>
                                                <span className="font-semibold w-24 inline-block">
                                                    Plat Kendaraan
                                                </span>
                                                : {deliveryOrder.vehicle_number || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-1/2 pl-4 text-right">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Referensi Dokumen:
                                        </p>
                                        <div className="text-sm text-slate-700 space-y-1 mt-2">
                                            <p>
                                                <span className="text-slate-500 mr-2">No. Pesanan (SO):</span>
                                                <span className="font-semibold">
                                                    {deliveryOrder.sales_order?.so_number || '-'}
                                                </span>
                                            </p>
                                            <p>
                                                <span className="text-slate-500 mr-2">Sales Staff:</span>
                                                <span className="font-medium">
                                                    {deliveryOrder.sales_order?.sales_person?.name || '-'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* TABEL BARANG FISIK */}
                                <table className="w-full text-sm border-collapse border border-slate-300 mb-6">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-800">
                                            <th className="border border-slate-300 py-3 px-4 text-center w-12 font-semibold">
                                                No.
                                            </th>
                                            <th className="border border-slate-300 py-3 px-4 text-left font-semibold">
                                                Nama / Deskripsi Barang Fisik
                                            </th>
                                            <th className="border border-slate-300 py-3 px-4 text-center w-32 font-semibold">
                                                Qty Kirim
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deliveryOrder.items?.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="border border-slate-300 py-3 px-4 text-center text-slate-600">
                                                    {idx + 1}
                                                </td>
                                                <td className="border border-slate-300 py-3 px-4 text-slate-800 font-medium">
                                                    {item.item_name}
                                                </td>
                                                <td className="border border-slate-300 py-3 px-4 text-center font-bold text-slate-800 text-base">
                                                    {item.quantity}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* CATATAN PENGIRIMAN */}
                                {deliveryOrder.notes && (
                                    <div className="mb-8 text-xs text-slate-700">
                                        <p className="font-bold underline mb-1">Catatan Tambahan:</p>
                                        <p className="whitespace-pre-wrap">{deliveryOrder.notes}</p>
                                    </div>
                                )}

                                <div className="mb-8 text-xs italic text-slate-500">
                                    * Harap periksa kondisi fisik dan jumlah barang sebelum menandatangani
                                    surat jalan ini. Barang yang sudah diterima dengan baik dan ditandatangani
                                    tidak dapat dikembalikan.
                                </div>

                                {/* KOLOM TANDA TANGAN 3 PIHAK */}
                                <div className="flex justify-between items-end mt-12 pt-8 border-t border-slate-200 text-sm text-center">
                                    <div className="w-1/3">
                                        <p className="mb-16 font-semibold text-slate-600">
                                            Disiapkan Oleh (Gudang),
                                        </p>
                                        <div className="border-b border-slate-400 mx-8"></div>
                                        <p className="mt-2 text-xs text-slate-500">Nama Terang & Cap</p>
                                    </div>
                                    <div className="w-1/3">
                                        <p className="mb-16 font-semibold text-slate-600">
                                            Dibawa Oleh (Supir/Kurir),
                                        </p>
                                        <div className="border-b border-slate-400 mx-8"></div>
                                        <p className="mt-2 text-xs text-slate-500">
                                            {deliveryOrder.driver_name || 'Nama Terang'}
                                        </p>
                                    </div>
                                    <div className="w-1/3">
                                        <p className="mb-16 font-semibold text-slate-800">
                                            Diterima Oleh (Klien),
                                        </p>
                                        <div className="border-b border-slate-800 mx-8"></div>
                                        <p className="mt-2 text-xs text-slate-500">
                                            Tgl Terima, Nama & Cap Perusahaan
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        @media print {
                            body { background: white !important; }
                            @page { margin: 0.4in; size: A4; }
                        }
                    `,
                }}
            />
        </>
    );
}
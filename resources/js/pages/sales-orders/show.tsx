import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, ArrowLeft, CheckCircle2, Clock, FileText, Truck, ShieldAlert, History, Package } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

// Import Partials
import SalesOrderSummary from './partials/SalesOrderSummary';
import TabItems from './partials/TabItems';
import TabDelivery from './partials/TabDelivery';
import TabInvoice from './partials/TabInvoice';
import TabAuditTrail from './partials/TabAuditTrail';

export default function SalesOrderShow({ salesOrder }: any) {
    const { hasPermission } = usePermission();
    const so = salesOrder?.data || salesOrder;

    const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

    const handleApprove = () => {
        if (confirm('Anda yakin ingin menyetujui Sales Order ini?')) {
            router.patch(route('sales-orders.approve', so.id));
        }
    };

    return (
        <AppLayout>
            <Head title={`Detail SO - ${so.so_number}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                            <ArrowLeft className="size-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <ShoppingCart className="size-6 text-primary" /> 
                                {so.so_number}
                            </h1>
                            <p className="text-muted-foreground text-sm">Klien: <span className="font-semibold text-slate-800">{so.client_name}</span></p>
                        </div>
                    </div>
                    
                    <div>
                        {so.approval_status === 'approved' ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent px-3 py-1 flex gap-1.5 items-center text-sm">
                                <CheckCircle2 className="size-4" /> Approved
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 px-3 py-1 flex gap-1.5 items-center text-sm">
                                <Clock className="size-4" /> Menunggu Persetujuan
                            </Badge>
                        )}
                    </div>
                </div>
                
                {so.approval_status === 'waiting_approval' && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4">
                        <div className="flex items-start gap-3">
                            <ShieldAlert className="size-6 text-amber-600 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-bold text-amber-900">Butuh Persetujuan Manajer/Direktur</h4>
                                <p className="text-sm text-amber-700 mt-1">
                                    Dokumen ini bernilai <b>{formatRp(so.grand_total)}</b>. Silakan periksa rincian sebelum menyetujui.
                                </p>
                            </div>
                        </div>
                        
                        {hasPermission('sales_orders.approve') && (
                            <Button onClick={handleApprove} className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
                                Setujui Dokumen
                            </Button>
                        )}
                    </div>
                )}

                <SalesOrderSummary so={so} />

                <Tabs defaultValue="items" className="w-full mt-2">
                    <TabsList className="grid w-full md:w-[600px] grid-cols-4 bg-slate-100 p-1 rounded-lg">
                        <TabsTrigger value="items" className="rounded-md gap-2"><Package className="size-4 hidden sm:block" /> Barang</TabsTrigger>
                        <TabsTrigger value="delivery" className="rounded-md gap-2"><Truck className="size-4 hidden sm:block" /> Surat Jalan</TabsTrigger>
                        <TabsTrigger value="invoice" className="rounded-md gap-2"><FileText className="size-4 hidden sm:block" /> Faktur</TabsTrigger>
                        <TabsTrigger value="audit" className="rounded-md gap-2"><History className="size-4 hidden sm:block" /> Audit Trail</TabsTrigger>
                    </TabsList>

                    <TabsContent value="items" className="mt-6">
                        <TabItems so={so} />
                    </TabsContent>

                    <TabsContent value="delivery" className="mt-6">
                        <TabDelivery so={so} />
                    </TabsContent>

                    <TabsContent value="invoice" className="mt-6">
                        <TabInvoice so={so} />
                    </TabsContent>

                    <TabsContent value="audit" className="mt-6">
                        <TabAuditTrail so={so} />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
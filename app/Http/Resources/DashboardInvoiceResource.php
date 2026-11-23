<?php

namespace App\Http\Resources;

use App\Models\Invoice;
use App\Models\PaymentReceipt;
use App\Models\SalesOrder;
use App\Models\SalesTarget;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Inertia\Inertia;

class DashboardInvoiceResource extends JsonResource
{
    public function index(Request $request)
    {
        $tenantId = session('active_tenant_id');

        return Inertia::render('dashboard', [
            'metrics'              => $this->getDashboardMetrics($tenantId),
            'recentUnpaidInvoices' => DashboardInvoiceResource::collection(
                $this->getRecentUnpaidInvoices($tenantId)
            )
        ]);
    }

    /**
     * Mengambil rangkuman metrik kalkulasi (SUM, COUNT).
     */
    private function getDashboardMetrics(string $tenantId): array
    {
        $currentMonth = Carbon::now()->month;
        $currentYear  = Carbon::now()->year;

        // 1. Total Piutang (Klien yang belum bayar)
        $outstandingReceivables = Invoice::where('tenant_id', $tenantId)
            ->where('status', '!=', 'paid')
            ->sum('balance_due');

        // 2. Pendapatan Nyata Bulan Ini
        $monthlyRevenue = PaymentReceipt::where('tenant_id', $tenantId)
            ->whereMonth('payment_date', $currentMonth)
            ->whereYear('payment_date', $currentYear)
            ->sum('amount_paid');

        // 3. SO yang Menunggu Persetujuan
        $pendingApprovals = SalesOrder::where('tenant_id', $tenantId)
            ->where('approval_status', 'waiting_approval')
            ->count();

        // 4. Target Sales Pribadi
        $myTarget = SalesTarget::where('tenant_id', $tenantId)
            ->where('user_id', auth()->id())
            ->where('month_year', Carbon::now()->format('Y-m'))
            ->first();

        return [
            'outstanding_receivables' => (float) $outstandingReceivables,
            'monthly_revenue'         => (float) $monthlyRevenue,
            'pending_approvals'       => $pendingApprovals,
            'my_target'               => $myTarget ? (float) $myTarget->target_amount : 0,
            'my_achievement'          => $myTarget ? (float) $myTarget->achieved_amount : 0,
        ];
    }

    private function getRecentUnpaidInvoices(string $tenantId)
    {
        return Invoice::with('salesPerson:id,name') // Mencegah N+1
            ->where('tenant_id', $tenantId)
            ->where('balance_due', '>', 0)
            ->orderBy('due_date', 'asc') // Urutkan dari yang paling mendekati jatuh tempo
            ->take(5)
            // PERBAIKAN BUG: Wajib masukkan 'sales_user_id' agar relasi salesPerson tidak null
            ->get(['id', 'invoice_number', 'client_name', 'due_date', 'balance_due', 'status', 'sales_user_id']); 
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Invoice;
use App\Models\SalesOrder;
use App\Models\SalesTarget;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = session('active_tenant_id');
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        // Total Piutang (Uang Klien yang belum masuk / Balance Due)
        $outstandingReceivables = Invoice::where('tenant_id', $tenantId)
            ->where('status', '!=', 'paid')
            ->sum('balance_due');

        // Pendapatan Nyata Bulan Ini (Hanya dari yang sudah dibayar/dicicil di bulan ini)
        $monthlyRevenue = \App\Models\PaymentReceipt::where('tenant_id', $tenantId)
            ->whereMonth('payment_date', $currentMonth)
            ->whereYear('payment_date', $currentYear)
            ->sum('amount_paid');

        // SO yang Menunggu Persetujuan Manajer
        $pendingApprovals = SalesOrder::where('tenant_id', $tenantId)
            ->where('approval_status', 'waiting_approval')
            ->count();

        // Pencapaian Sales Pribadi (Jika yang login adalah Sales)
        $myTarget = SalesTarget::where('tenant_id', $tenantId)
            ->where('user_id', auth()->id())
            ->where('month_year', Carbon::now()->format('Y-m'))
            ->first();

        // Faktur Terakhir yang Belum Lunas
        $recentUnpaidInvoices = Invoice::with('salesPerson:id,name')
            ->where('tenant_id', $tenantId)
            ->where('balance_due', '>', 0)
            ->orderBy('due_date', 'asc')
            ->take(5)
            ->get(['id', 'invoice_number', 'client_name', 'due_date', 'balance_due', 'status']);

        return Inertia::render('dashboard', [
            'metrics' => [
                'outstanding_receivables' => $outstandingReceivables,
                'monthly_revenue' => $monthlyRevenue,
                'pending_approvals' => $pendingApprovals,
                'my_target' => $myTarget ? $myTarget->target_amount : 0,
                'my_achievement' => $myTarget ? $myTarget->achieved_amount : 0,
            ],
            'recentUnpaidInvoices' => $recentUnpaidInvoices
        ]);
    }
}
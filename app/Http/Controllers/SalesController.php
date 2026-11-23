<?php

namespace App\Http\Controllers;

use App\Http\Resources\Sales\SalesPerformanceResource;
use App\Http\Resources\Sales\SalesTargetResource;
use App\Models\SalesTarget;
use App\Models\SalesVisit;
use App\Models\User;
use App\Models\Division;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SalesController extends Controller
{
    public function index()
    {
        $tenantId = session('active_tenant_id');
        
        $currentMonth = Carbon::now()->format('Y-m');
        $lastMonth = Carbon::now()->subMonth()->format('Y-m');

        // STATISTIK KPI
        $currentTargets = DB::table('sales_targets')
            ->where('tenant_id', $tenantId)
            ->where('month_year', $currentMonth)
            ->get();

        $totalTarget = $currentTargets->sum('target_amount');
        $totalAchieved = $currentTargets->sum('achieved_amount');
        $achievementPercentage = $totalTarget > 0 ? round(($totalAchieved / $totalTarget) * 100, 1) : 0;

        $totalPoints = DB::table('sales_rewards')
            ->where('tenant_id', $tenantId)
            ->sum('points_earned');

        $lastMonthAchieved = DB::table('sales_targets')
            ->where('tenant_id', $tenantId)
            ->where('month_year', $lastMonth)
            ->sum('achieved_amount');

        $growth = 0;
        if ($lastMonthAchieved > 0) {
            $growth = round((($totalAchieved - $lastMonthAchieved) / $lastMonthAchieved) * 100, 1);
        }
        $growthStr = $growth >= 0 ? "+{$growth}%" : "{$growth}%";

        $performanceStats = [
            'total_revenue' => $totalAchieved,
            'total_points_distributed' => $totalPoints,
            'target_achievement' => $achievementPercentage,
            'growth' => $growthStr,
        ];

        // ANALISIS TREN PASAR (6 Bulan Terakhir)
        $marketTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStr = Carbon::now()->subMonths($i)->format('Y-m');
            $monthName = Carbon::now()->subMonths($i)->translatedFormat('M');

            $data = DB::table('sales_targets')
                ->where('tenant_id', $tenantId)
                ->where('month_year', $monthStr)
                ->selectRaw('SUM(achieved_amount) as revenue, SUM(target_amount) as target')
                ->first();

            $marketTrend[] = [
                'name' => $monthName,
                'revenue' => $data->revenue ? (float) $data->revenue / 1000000 : 0, 
                'target' => $data->target ? (float) $data->target / 1000000 : 0,
            ];
        }

        // LEADERBOARD KINERJA SALES & TIER GAMIFIKASI
        // Cari ID Divisi Sales & Marketing terlebih dahulu

        $salesDivision = Division::where('tenant_id', $tenantId)
            ->where('name', 'like', '%Sales%Marketing%')
            ->first();

        // Kueri Leaderboard dengan memastikan User tersebut berada di divisi Sales
        $queryLeaderboard = DB::table('sales_rewards')
            ->where('sales_rewards.tenant_id', $tenantId)
            ->join('users', 'sales_rewards.user_id', '=', 'users.id')
            ->join('tenant_user', function($join) use ($tenantId) {
                $join->on('users.id', '=', 'tenant_user.user_id')
                     ->where('tenant_user.tenant_id', '=', $tenantId);
            });

        if ($salesDivision) {
            $queryLeaderboard->where('tenant_user.division_id', $salesDivision->id);
        }

        $salesUsers = $queryLeaderboard->select('users.name', 'users.id', DB::raw('SUM(sales_rewards.points_earned) as total_points'))
            ->groupBy('users.id', 'users.name')
            ->orderBy('total_points', 'desc')
            ->take(5)
            ->get();

        $salesPerformance = $salesUsers->map(function ($sales) use ($tenantId) {
            $achieved = DB::table('sales_targets')
                ->where('tenant_id', $tenantId)
                ->where('user_id', $sales->id)
                ->sum('achieved_amount');

            $tier = 'Bronze';
            if ($sales->total_points >= 5000) {
                $tier = 'Platinum';
            } elseif ($sales->total_points >= 2000) {
                $tier = 'Gold';
            } elseif ($sales->total_points >= 500) {
                $tier = 'Silver';
            }

            // Ubah menjadi array/object yang siap dimakan oleh Resource
            return (object) [
                'name' => $sales->name,
                'sales' => $achieved / 1000000, 
                'points' => (int) $sales->total_points,
                'tier' => $tier
            ];
        });

        // UP-SELLING ENGINE
        // $upSellingProducts = [];

        return Inertia::render('sales/index', [
            'stats' => $performanceStats,
            'marketTrend' => $marketTrend,
            'salesPerformance' => SalesPerformanceResource::collection($salesPerformance),
            // 'upSellingProducts' => $upSellingProducts
        ]);
    }
    
    public function create()
    {
        return Inertia::render('sales/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'client_name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'photo' => 'nullable|image|max:2048'
        ]);

        $activeTenantId = session('active_tenant_id');
        $userId = auth()->id();

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('visits', 'public');
        }

        $visit = SalesVisit::create([
            'tenant_id' => $activeTenantId,
            'user_id' => $userId,
            'client_name' => $request->client_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'photo_path' => $photoPath,
        ]);

        DB::table('sales_rewards')->insert([
            'tenant_id' => $activeTenantId,
            'user_id' => $userId,
            'points_earned' => 10,
            'source_type' => 'visit_checkin',
            'reference_number' => 'VISIT-' . $visit->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('sales.visits.create')->with('success', 'Kunjungan berhasil dicatat! Anda mendapatkan +10 Poin.');
    }

    public function salesTarget(Request $request)
    {
        $tenantId = session('active_tenant_id');
        $selectedMonth = $request->query('month', Carbon::now()->format('Y-m'));

        // Cari ID Divisi "Sales & Marketing"
        $salesDivision = Division::where('tenant_id', $tenantId)
            ->where('name', 'like', '%Sales%Marketing%')
            ->first();

        // Ambil Karyawan (HANYA Divisi Sales & Marketing yang aktif)
        $employees = collect();
        if ($salesDivision) {
            $employees = User::whereHas('tenants', function($q) use ($tenantId, $salesDivision) {
                $q->where('tenant_user.tenant_id', $tenantId)
                  ->where('tenant_user.is_active', true)
                  ->where('tenant_user.division_id', $salesDivision->id);
            })->get(['id', 'name']);
        }

        // Ambil data target di bulan yang dipilih
        $targets = SalesTarget::where('tenant_id', $tenantId)
            ->where('month_year', $selectedMonth)
            ->get();

        // Gabungkan dan format data menggunakan Object (agar bisa dibaca Resource)
        $salesData = $employees->map(function($emp) use ($targets) {
            $target = $targets->firstWhere('user_id', $emp->id);
            return (object) [
                'user_id' => $emp->id,
                'name' => $emp->name,
                'target_amount' => $target ? $target->target_amount : 0,
                'achieved_amount' => $target ? $target->achieved_amount : 0,
            ];
        });

        return Inertia::render('sales/target', [
            'salesData' => SalesTargetResource::collection($salesData),
            'currentMonth' => $selectedMonth
        ]);
    }

    public function salesTargetStore(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'month_year' => 'required|date_format:Y-m',
            'target_amount' => 'required|numeric|min:0'
        ]);

        SalesTarget::updateOrCreate(
            [
                'tenant_id' => session('active_tenant_id'),
                'user_id' => $request->user_id,
                'month_year' => $request->month_year
            ],
            [
                'target_amount' => $request->target_amount
            ]
        );

        return redirect()->back()->with('success', 'Target berhasil ditetapkan.');
    }
}   
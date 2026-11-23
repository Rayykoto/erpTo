<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Holiday;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index()
    {
        $activeTenantId = session('active_tenant_id');
        $user = auth()->user();

        $attendances = Attendance::where('tenant_id', $activeTenantId)
            ->where('user_id', $user->id)
            ->orderBy('date', 'asc')
            ->get();

        $today = Carbon::today()->format('Y-m-d');
        $todayAttendance = Attendance::where('tenant_id', $activeTenantId)
            ->where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        // Tabel holidays memiliki kolom 'date' (YYYY-MM-DD) dan 'name' (Nama Libur)
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        
        $holidays = Holiday::whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->get(['date', 'name']);

        return Inertia::render('attendances/index', [
            'attendances' => $attendances,
            'todayAttendance' => $todayAttendance,
            'holidays' => $holidays
        ]);
    }

    public function clockIn(Request $request)
    {
        $activeTenantId = session('active_tenant_id');
        $today = Carbon::today()->format('Y-m-d');
        $currentTime = Carbon::now();

        // Jika lewat dari jam 09:00, anggap 'late'
        $status = $currentTime->format('H:i') > '09:00' ? 'late' : 'present';

        Attendance::firstOrCreate([
            'tenant_id' => $activeTenantId,
            'user_id' => auth()->id(),
            'date' => $today
        ], [
            'clock_in' => $currentTime,
            'status' => $status
        ]);

        return redirect()->back()->with('success', 'Berhasil Absen Masuk!');
    }

    public function clockOut(Request $request)
    {
        $activeTenantId = session('active_tenant_id');
        $today = Carbon::today()->format('Y-m-d');

        $attendance = Attendance::where('tenant_id', $activeTenantId)
            ->where('user_id', auth()->id())
            ->where('date', $today)
            ->first();

        if ($attendance && !$attendance->clock_out) {
            $attendance->update([
                'clock_out' => Carbon::now()
            ]);
            return redirect()->back()->with('success', 'Berhasil Absen Pulang!');
        }

        return redirect()->back()->with('error', 'Gagal memproses absen pulang.');
    }
}
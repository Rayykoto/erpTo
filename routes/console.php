<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Format yearlyOn(bulan, tanggal, jam) -> Berjalan tiap 1 Januari jam 01:00 pagi
Schedule::command('holidays:sync')->yearlyOn(1, 1, '01:00');

// for cleanup trial
Schedule::command('tenant:cleanup-expired')->dailyAt('00:00');
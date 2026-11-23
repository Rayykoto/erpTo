<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Holiday;

class SyncHolidays extends Command
{
    protected $signature = 'holidays:sync {year?}';
    protected $description = 'Auto-generate tanggal merah Indonesia secara dinamis dari API';

    public function handle()
    {
        $year = $this->argument('year') ?? date('Y');
        $this->info("Menarik data libur nasional untuk tahun {$year}...");

        try {
            // Menambahkan headers secara eksplisit
            $response = Http::withoutVerifying()
                ->timeout(20)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post("https://api-harilibur.pages.dev/api", [
                    'year' => (int) $year
                ]);

            if ($response->successful()) {
                $result = $response->json();
                $holidays = is_array($result) ? ($result['data'] ?? $result) : [];

                if (empty($holidays)) {
                    $this->warn("API merespons sukses, tetapi data kosong untuk tahun {$year}.");
                    return;
                }

                $count = 0;
                foreach ($holidays as $holiday) {
                    $date = $holiday['holiday_date'] ?? $holiday['tanggal'] ?? $holiday['date'] ?? null;
                    $name = $holiday['holiday_name'] ?? $holiday['keterangan'] ?? $holiday['name'] ?? 'Libur Nasional';
                    $isNational = $holiday['is_national_holiday'] ?? $holiday['is_national'] ?? true;

                    if ($date && $isNational) {
                        Holiday::updateOrCreate(
                            ['date' => $date],
                            [
                                'name' => $name,
                                'is_national' => true
                            ]
                        );
                        $count++;
                    }
                }

                $this->info("Berhasil menyimpan {$count} hari libur nasional tahun {$year} ke database!");
            } else {
                // Tampilkan pesan error detail dari body respons server jika ada
                $this->error("Gagal terhubung ke API. Status Code: " . $response->status());
                $this->error("Pesan dari Server: " . $response->body());
            }
        } catch (\Exception $e) {
            $this->error("Terjadi error sistem: " . $e->getMessage());
        }
    }
}
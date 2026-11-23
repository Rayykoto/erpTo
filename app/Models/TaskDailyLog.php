<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskDailyLog extends Model
{
    // Mengizinkan semua kolom diisi secara massal
    protected $guarded = [];

    // Cast tanggal agar otomatis menjadi objek
    protected $casts = [
        'log_date' => 'date',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{   
    use BelongsToTenant, Auditable;
    
    protected $fillable = [
        'tenant_id', 'user_id', 'date', 'clock_in', 'clock_out', 'status', 'notes'
    ];

    // Konversi tipe data otomatis
    protected $casts = [
        'date' => 'date',
        'clock_in' => 'datetime',
        'clock_out' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
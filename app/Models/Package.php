<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'max_companies', 'features'];

    protected $casts = [
        'features' => 'array', 
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}
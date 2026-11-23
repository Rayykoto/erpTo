<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'whatsapp_number',
        'password',
        'is_super_admin'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'is_super_admin' => 'boolean',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function tenants()
    {
        return $this->belongsToMany(Tenant::class)
        ->withPivot('is_active', 'division_id')
        ->withTimestamps();
    }
    
    public function subscription()
    {
        return $this->hasOne(Subscription::class)->where('status', 'active')->latest();
    }

    // Helper untuk mengecek apakah user boleh membuat cabang baru
    public function canCreateMoreCompanies(): bool
    {
        // Berapa jumlah tenant yang dimiliki user ini sekarang?
        $currentCompaniesCount = $this->tenants()->count();
        
        // Berapa kuota maksimal dari paketnya? (Default 1 jika belum punya paket)
        $maxCompanies = $this->subscription ? $this->subscription->package->max_companies : 1;

        return $currentCompaniesCount < $maxCompanies;
    }
}
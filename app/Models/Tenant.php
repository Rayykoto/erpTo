<?php

namespace App\Models;

use App\Traits\Auditable;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains, Auditable;

    public $incrementing = false; // Matikan auto-increment
    protected $keyType = 'string'; // Set jenis primary key ke string

    public static function getCustomColumns(): array
    {
        return [
            'id', 'name',  'logo', 'address', 'director', 'trials_end_at'
        ];
    }

    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}
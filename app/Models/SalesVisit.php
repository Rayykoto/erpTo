<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class SalesVisit extends Model
{
    use Auditable;
    protected $fillable = [
        'tenant_id', 'user_id', 'client_name', 'email', 
        'phone', 'latitude', 'longitude', 'photo_path'
    ];
}
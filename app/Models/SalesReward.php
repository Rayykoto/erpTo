<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class SalesReward extends Model
{
    use Auditable;
    protected $fillable = ['tenant_id', 'user_id', 'reference_number', 'points_earned', 'source_type', 'status'];
}
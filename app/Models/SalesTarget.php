<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class SalesTarget extends Model
{
    use Auditable;
    protected $fillable = ['tenant_id', 'user_id', 'month_year', 'target_amount', 'achieved_amount'];
}
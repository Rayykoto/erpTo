<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use BelongsToTenant, Auditable;

    protected $guarded = ['id'];

    public function ledgers()
    {
        return $this->hasMany(StockLedger::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

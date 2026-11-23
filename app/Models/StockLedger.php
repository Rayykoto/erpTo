<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class StockLedger extends Model
{
    use BelongsToTenant;

    protected $guarded = ['id'];

    // Relasi polimorfik (Akan otomatis menarik data DeliveryOrder atau dokumen lainnya)
    public function reference()
    {
        return $this->morphTo();
    }
}

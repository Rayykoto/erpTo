<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class PurchaseOrder extends Model
{
    use HasFactory, BelongsToTenant, Auditable;

    protected $guarded = [];

    protected $casts = [
        'order_date' => 'date',
    ];

    // Relasi ke baris barang yang dipesan
    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    // Relasi ke Bukti Terima Barang (GR)
    public function goodsReceipts()
    {
        return $this->hasMany(GoodsReceipt::class);
    }

    // Relasi ke User yang membuat dokumen
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function responsiblePerson()
    {
        return $this->belongsTo(User::class, 'responsible_person');
    }
}

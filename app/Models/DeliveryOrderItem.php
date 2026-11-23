<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class DeliveryOrderItem extends Model
{
    protected $fillable = ['delivery_order_id', 'product_id', 'item_name', 'quantity'];
}
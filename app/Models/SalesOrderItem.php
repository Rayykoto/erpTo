<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class SalesOrderItem extends Model
{
    protected $fillable = ['sales_order_id', 'product_id', 'item_name', 'quantity', 'unit_price', 'total_price'];
}
<?php

namespace App\Http\Resources\GoodsReceipt;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PendingPoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'po_number'       => $this->po_number,
            'supplier_name'   => $this->supplier_name,
            'order_date'      => $this->order_date,
            'approval_status' => $this->approval_status ?? $this->status,
        ];
    }
}
<?php

namespace App\Http\Resources\DeliveryOrder;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PendingDeliveryOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'do_number'     => $this->do_number,
            'client_name'   => $this->client_name,
            'delivered_at'  => $this->delivered_at,
            'status'        => $this->status,
            'sales_order'  => $this->whenLoaded('salesOrder', function () {
                return [
                    'id'        => $this->salesOrder->id,
                    'so_number' => $this->salesOrder->so_number,
                ];
            }),
        ];
    }
}
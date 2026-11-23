<?php

namespace App\Http\Resources\SalesOrder;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalesOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'so_number'       => $this->so_number,
            'client_name'     => $this->client_name,
            'order_date'      => $this->order_date,
            'grand_total'     => (float) $this->grand_total,
            'status'          => $this->status,
            'approval_status' => $this->approval_status,
            'total_invoiced_amount' => (float) $this->total_invoiced_amount,

            'sales_person' => $this->whenLoaded('salesPerson', function () {
                return [
                    'id'   => $this->salesPerson->id,
                    'name' => $this->salesPerson->name,
                ];
            }),
        ];
    }
}
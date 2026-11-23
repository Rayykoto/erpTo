<?php

namespace App\Http\Resources\Invoice;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'invoice_number' => $this->invoice_number,
            'client_name'    => $this->client_name,
            'issue_date'     => $this->issue_date,
            'grand_total'    => (float) $this->grand_total,
            'status'         => $this->status,
            
            // Relasi aman tanpa N+1
            'sales_person'   => $this->whenLoaded('salesPerson', function () {
                return [
                    'id'   => $this->salesPerson->id,
                    'name' => $this->salesPerson->name,
                ];
            }),
            'sales_order'    => $this->whenLoaded('salesOrder', function () {
                return [
                    'id'        => $this->salesOrder->id,
                    'so_number' => $this->salesOrder->so_number,
                ];
            }),
            'delivery_order' => $this->whenLoaded('deliveryOrder', function () {
                return [
                    'id'        => $this->deliveryOrder->id,
                    'do_number' => $this->deliveryOrder->do_number,
                ];
            }),
        ];
    }
}
<?php

namespace App\Http\Resources\PurchaseOrder;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'po_number'       => $this->po_number,
            'supplier_name'   => $this->supplier_name,
            'order_date'      => $this->order_date, 
            'grand_total'     => (float) $this->grand_total,
            'status'          => $this->status,
            'approval_status' => $this->approval_status,
            'creator'      => $this->whenLoaded('creator', function () {
                return [
                    'id'   => $this->creator->id,
                    'name' => $this->creator->name,
                ];
            }),
            'approver' => $this->whenLoaded('responsiblePerson', function () {
                return [
                    'id' => $this->responsiblePerson->id,
                    'name' => $this->responsiblePerson->name,
                ];
            }),
        ];
    }
}

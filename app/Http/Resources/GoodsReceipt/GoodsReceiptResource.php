<?php

namespace App\Http\Resources\GoodsReceipt;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoodsReceiptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'gr_number'     => $this->gr_number,
            'supplier_name' => $this->supplier_name,
            'receipt_date'  => $this->receipt_date,
            'status'        => $this->status,
            
            // Relasi aman dari N+1 Query
            'purchase_order' => $this->whenLoaded('purchaseOrder', function () {
                return [
                    'id'        => $this->purchaseOrder->id,
                    'po_number' => $this->purchaseOrder->po_number,
                ];
            }),
            'responsible_person' => $this->whenLoaded('responsiblePerson', function () {
                return [
                    'id'   => $this->responsiblePerson->id,
                    'name' => $this->responsiblePerson->name,
                ];
            }),
            'created_by' => $this->whenLoaded('createdBy', function () {
                return [
                    'id'   => $this->createdBy->id,
                    'name' => $this->createdBy->name,
                ];
            }),
        ];
    }
}
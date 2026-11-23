<?php

namespace App\Http\Resources\GoodsReceipt;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoodsReceiptDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'gr_number'     => $this->gr_number,
            'supplier_name' => $this->supplier_name,
            'receipt_date'  => $this->receipt_date,
            'receiver_name' => $this->receiver_name,
            'status'        => $this->status,
            'responsible_person' => $this->whenLoaded('responsiblePerson', function () {
                return [
                    'id'   => $this->responsiblePerson->id,
                    'name' => $this->responsiblePerson->name,
                ];
            }),
            'notes'         => $this->notes,

            'purchase_order' => $this->whenLoaded('purchaseOrder', function () {
                return [
                    'id'        => $this->purchaseOrder->id,
                    'po_number' => $this->purchaseOrder->po_number,
                ];
            }),
            'created_by' => $this->whenLoaded('createdBy', function () {
                return [
                    'id'   => $this->createdBy->id,
                    'name' => $this->createdBy->name,
                ];
            }),
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(fn($item) => [
                    'id'         => $item->id,
                    'product_id' => $item->product_id,
                    'item_name'  => $item->item_name,
                    'quantity'   => (int) $item->quantity,
                ]);
            }),
        ];
    }
}
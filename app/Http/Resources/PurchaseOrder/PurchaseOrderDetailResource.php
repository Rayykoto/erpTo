<?php

namespace App\Http\Resources\PurchaseOrder;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'po_number'       => $this->po_number,
            'supplier_name'   => $this->supplier_name,
            'order_date'      => $this->order_date,
            'subtotal'        => (float) $this->subtotal,
            'tax_amount'      => (float) $this->tax_amount,
            'grand_total'     => (float) $this->grand_total,
            'status'          => $this->status,
            'approval_status' => $this->approval_status,
            'notes'           => $this->notes,

            // Informasi Pembuat Dokumen
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id'   => $this->creator->id,
                    'name' => $this->creator->name,
                ];
            }),

            // Informasi Manajer yang Menyetujui
            'approver' => $this->whenLoaded('responsiblePerson', function () {
                return [
                    'id'   => $this->responsiblePerson->id,
                    'name' => $this->responsiblePerson->name,
                ];
            }),

            // Daftar Barang yang Dipesan
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(function ($item) {
                    return [
                        'id'          => $item->id,
                        'product_id'  => $item->product_id,
                        'item_name'   => $item->item_name,
                        'quantity'    => (int) $item->quantity,
                        'unit_price'  => (float) $item->unit_price,
                        'total_price' => (float) $item->total_price,
                    ];
                });
            }),
        ];
    }
}
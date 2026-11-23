<?php

namespace App\Http\Resources\SalesOrder;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalesOrderDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'so_number'       => $this->so_number,
            'client_name'     => $this->client_name,
            'order_date'      => $this->order_date,
            'subtotal'        => (float) $this->subtotal,
            'tax_amount'      => (float) $this->tax_amount,
            'grand_total'     => (float) $this->grand_total,
            'status'          => $this->status,
            'approval_status' => $this->approval_status,
            'notes'           => $this->notes,

            'sales_person' => $this->whenLoaded('salesPerson', function () {
                return [
                    'id'   => $this->salesPerson->id,
                    'name' => $this->salesPerson->name,
                ];
            }),

            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(fn($item) => [
                    'id'          => $item->id,
                    'product_id'  => $item->product_id,
                    'item_name'   => $item->item_name,
                    'quantity'    => (int) $item->quantity,
                    'unit_price'  => (float) $item->unit_price,
                    'total_price' => (float) $item->total_price,
                ]);
            }),
            'delivery_orders' => $this->whenLoaded('deliveryOrders'),
            'invoices' => $this->whenLoaded('invoices'),
            'activities' => $this->whenLoaded('activities', function () {
                return $this->activities->map(fn($activity) => [
                    'id'          => $activity->id,
                    'description' => $activity->description,
                    'event'       => $activity->event,
                    'properties'  => $activity->properties,
                    'created_at'  => $activity->created_at,
                    'causer'      => $activity->causer ? [
                        'id'   => $activity->causer->id,
                        'name' => $activity->causer->name,
                    ] : null,
                ]);
            }), 
        ];
    }
}
<?php

namespace App\Http\Resources\Sales;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalesTargetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user_id'         => $this->user_id,
            'name'            => $this->name,
            'target_amount'   => (float) $this->target_amount,
            'achieved_amount' => (float) $this->achieved_amount,
        ];
    }
}
<?php

namespace App\Http\Resources\Sales;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalesPerformanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'name'   => $this->name,
            'sales'  => (float) $this->sales,
            'points' => (int) $this->points,
            'tier'   => $this->tier,
        ];
    }
}
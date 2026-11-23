<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant()
    {
        // Otomatis filter data berdasarkan perusahaan yang sedang aktif di sesi
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (session()->has('active_tenant_id')) {
                $builder->where('tenant_id', session('active_tenant_id'));
            }
        });

        // Otomatis isi tenant_id saat menyimpan data baru
        static::creating(function ($model) {
            if (session()->has('active_tenant_id') && empty($model->tenant_id)) {
                $model->tenant_id = session('active_tenant_id');
            }
        });
    }
}
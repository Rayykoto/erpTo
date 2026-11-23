<?php

namespace App\Traits;

use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

trait Auditable
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        $modelName = class_basename($this);

        return LogOptions::defaults()
            ->logAll()
            // kolom ini TIDAK PERNAH masuk ke JSON properties
            ->logExcept(['password', 'remember_token', 'updated_at', 'created_at']) 
            // Batalkan log jika yang berubah HANYA kolom ini saja (tidak ada perubahan data substansial)
            ->dontLogIfAttributesChangedOnly(['password', 'remember_token', 'updated_at'])
            ->logOnlyDirty() 
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Data {$modelName} telah di-{$eventName}");
    }
}
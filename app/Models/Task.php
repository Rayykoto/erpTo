<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Task extends Model
{
    use BelongsToTenant, Auditable;
    
    protected $fillable = [
        'tenant_id', 'team', 'brand', 'project', 'title', 
        'start_date', 'working_days', 'end_date', 'progress', 
        'description', 'notes', 'status', 'is_assignable', 
        'position', 'assigned_to', 'created_by'
    ];

    protected $appends = ['is_late'];

    protected $casts = [
        'is_assignable' => 'boolean',
        'start_date' => 'date:Y-m-d', 
        'end_date' => 'date',
        'working_days' => 'integer',
    ];
    
    // =========================================================
    // OTOMATISASI PROGRESS & END_DATE (DIJALANKAN SETIAP SAVE)
    // =========================================================
    protected static function booted()
    {
        static::saving(function ($task) {
            // 1. Auto Progress berdasarkan Status
            if ($task->status === 'pending') $task->progress = 0;
            elseif ($task->status === 'in_progress') $task->progress = 50;
            elseif ($task->status === 'completed') $task->progress = 100;

            // 2. Auto End Date (Mulai + Hari Kerja, melewati Sabtu-Minggu)
            if ($task->start_date && $task->working_days) {
                // Kurangi 1 karena hari mulai dihitung sebagai hari ke-1
                $daysToAdd = max(0, $task->working_days - 1);
                $task->end_date = Carbon::parse($task->start_date)->addWeekdays($daysToAdd);
            } else {
                $task->end_date = null;
            }
        });
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function pastAssignees()
    {
        return $this->belongsToMany(User::class, 'task_past_assignees', 'task_id', 'user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function comments()
    {
        return $this->hasMany(TaskComment::class)->orderBy('created_at', 'asc');
    }

    public function getIsLateAttribute()
    {
        if ($this->status !== 'selesai' && $this->end_date) {
            return Carbon::now()->startOfDay()->gt(Carbon::parse($this->end_date));
        }
        return false;
    }
    
}
<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index()
    {
        $activeTenantId = session('active_tenant_id');
        $user = auth()->user();

        // 1. Sinkronisasi Tanggal Merah (Otomatis)
        $currentYear = date('Y');
        if (!Holiday::whereYear('date', $currentYear)->exists()) {
            Artisan::call('holidays:sync', ['year' => $currentYear]);
        }

        // 2. PERBAIKAN: Gunakan permission tasks.view_all_tasks
        $canViewAll = $user->can('tasks.execute') || $user->hasRole('admin');

        // 3. Query dasar
        $tasksQuery = Task::with(['assignee', 'creator', 'pastAssignees', 'comments.user']) 
            ->where('tenant_id', $activeTenantId)
            ->orderBy('position', 'asc');

        // 4. BATASI DATA jika user tidak memiliki izin view_all_tasks
        if (!$canViewAll) {
            $tasksQuery->where(function($query) use ($user) {
                $query->where('assigned_to', $user->id)
                      ->orWhere('created_by', $user->id); // Tetap tampilkan jika dia yang membuat tugasnya
            });
        }

        $tasks = $tasksQuery->get();

        // 5. Hanya tarik daftar karyawan jika user berhak melihat semua tugas
        // Menghemat query database karena karyawan biasa tidak butuh dropdown user
        $employees = collect();
        if ($canViewAll) {
            $employees = User::whereHas('tenants', function($q) use ($activeTenantId) {
                $q->where('tenant_id', $activeTenantId);
            })->get(['id', 'name']);
        }

        $holidays = Holiday::select('date', 'name')->get();

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'employees' => $employees,
            'holidays' => $holidays,
            'canViewAll' => $canViewAll
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'status' => 'required|string|in:pending,in_progress,completed'
        ]);

        $activeTenantId = session('active_tenant_id');

        $lastPosition = Task::where('tenant_id', $activeTenantId)
                            ->where('status', $request->status)
                            ->max('position');

        Task::create([
            'tenant_id' => $activeTenantId,
            'title' => $request->title,
            'status' => $request->status,
            'description' => $request->description,
            'team' => $request->team,
            'brand' => $request->brand,
            'project' => $request->project,
            'start_date' => $request->start_date,
            'working_days' => $request->working_days,
            'is_assignable' => $request->boolean('is_assignable', true),
            'position' => $lastPosition + 1,
            'created_by' => auth()->id()
        ]);

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $task = Task::where('id', $id)
                    ->where('tenant_id', session('active_tenant_id'))
                    ->firstOrFail();

        $task->update($request->only([
            'title', 'description', 'team', 'brand', 'project',
            'start_date', 'working_days'
        ]));

        return redirect()->back();
    }

    public function updatePosition(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:tasks,id',
            'items.*.status' => 'required|string|in:pending,in_progress,completed',
            'items.*.position' => 'required|integer',
        ]);

        foreach ($request->items as $item) {
            $task = Task::where('id', $item['id'])
                ->where('tenant_id', session('active_tenant_id'))
                ->first();
                
            if ($task) {
                $task->status = $item['status'];
                $task->position = $item['position'];
                $task->save(); 
            }
        }

        return response()->json(['success' => true]);
    }

    public function assign(Request $request, $id)
    {
        $request->validate(['assigned_to' => 'nullable|exists:users,id']);

        $task = Task::where('id', $id)->where('tenant_id', session('active_tenant_id'))->firstOrFail();
        $user = auth()->user();

        $isCreator = $task->created_by === $user->id;
        $hasGlobalPermission = $user->can('tasks.assign'); 
        $isCurrentAssignee = $task->assigned_to === $user->id;
        $isPastAssignee = $task->pastAssignees()->where('user_id', $user->id)->exists();

        if (!$task->is_assignable && !$isCreator && !$hasGlobalPermission) {
            return redirect()->back()->with('error', 'Tugas ini dikunci. Hanya pembuat tugas yang dapat mengalihkan.');
        }
        if (!$isCreator && !$hasGlobalPermission && !$isCurrentAssignee && !$isPastAssignee) {
            return redirect()->back()->with('error', 'Akses ditolak. Anda tidak berhak mengalihkan tugas ini.');
        }

        $task->update(['assigned_to' => $request->assigned_to]);

        if ($request->assigned_to) {
            $task->pastAssignees()->syncWithoutDetaching([$request->assigned_to]);
        }

        return redirect()->back();
    }

    public function addComment(Request $request, $id)
    {
        $request->validate(['comment' => 'required|string']);
        $task = Task::where('id', $id)->where('tenant_id', session('active_tenant_id'))->firstOrFail();

        $task->comments()->create([
            'user_id' => auth()->id(),
            'comment' => $request->comment
        ]);

        return redirect()->back();
    }
}
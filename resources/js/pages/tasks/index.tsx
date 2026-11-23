import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import axios from 'axios';
import { Filter, LayoutGrid, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { TaskColumn, KANBAN_COLUMNS } from './partials/kanban-view';
import TimelineView from './partials/timeline-view';
import TaskDetailModal from './partials/task-detail-modal';

// Tangkap props holidays dari controller
export default function KanbanBoard({ tasks, employees, holidays = [] }: { tasks: any[], employees: any[], holidays?: string[] }) {
    const { auth } = usePage().props as any;
    const currentUser = auth.user;
    const permissions = auth.permission || [];

    const [filter, setFilter] = useState<'all' | 'me'>('all');
    const [viewMode, setViewMode] = useState<'board' | 'timeline'>('timeline'); 
    const [columns, setColumns] = useState<Record<string, any[]>>({ pending: [], in_progress: [], completed: [] });
    const [selectedTask, setSelectedTask] = useState<any | null>(null);

    useEffect(() => {
        let filteredTasks = tasks;
        if (filter === 'me') {
            filteredTasks = tasks.filter(t => t.assigned_to === currentUser.id);
        }

        setColumns({
            pending: filteredTasks.filter(t => t.status === 'pending').sort((a, b) => a.position - b.position),
            in_progress: filteredTasks.filter(t => t.status === 'in_progress').sort((a, b) => a.position - b.position),
            completed: filteredTasks.filter(t => t.status === 'completed').sort((a, b) => a.position - b.position),
        });
    }, [tasks, filter]);

    useEffect(() => {
        if (selectedTask && selectedTask.id) {
            const freshTask = tasks.find(t => t.id === selectedTask.id);
            if (freshTask) setSelectedTask(freshTask);
        }
    }, [tasks]);

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceColumn = source.droppableId;
        const destColumn = destination.droppableId;
        const newColumns = { ...columns };
        const sourceItems = Array.from(newColumns[sourceColumn]);
        const destItems = sourceColumn === destColumn ? sourceItems : Array.from(newColumns[destColumn]);

        const [movedTask] = sourceItems.splice(source.index, 1);
        movedTask.status = destColumn;
        
        if (destColumn === 'completed') movedTask.progress = 100;
        else if (destColumn === 'in_progress') movedTask.progress = 50;
        else movedTask.progress = 0;

        destItems.splice(destination.index, 0, movedTask);

        newColumns[sourceColumn] = sourceItems;
        newColumns[destColumn] = destItems;
        setColumns(newColumns);

        const itemsToUpdate: any[] = [];
        destItems.forEach((task, index) => itemsToUpdate.push({ id: task.id, status: destColumn, position: index }));
        if (sourceColumn !== destColumn) {
            sourceItems.forEach((task, index) => itemsToUpdate.push({ id: task.id, status: sourceColumn, position: index }));
        }

        axios.post(route('tasks.update-position'), { items: itemsToUpdate }).catch(() => router.reload());
    };

    const handleAssign = (taskId: number, userId: number | null) => {
        router.post(route('tasks.assign', taskId), { assigned_to: userId }, { preserveScroll: true });
    };

    const filteredTasks = filter === 'me' ? tasks.filter(t => t.assigned_to === currentUser.id) : tasks;

    return (
        <AppLayout>
            <Head title="Manajemen Tugas" />
            
            <div className="grid grid-cols-1 w-full max-w-full h-[calc(100vh-5rem)] overflow-hidden bg-slate-50 md:bg-transparent">
                <div className="flex flex-col gap-4 p-4 md:p-6 w-full h-full min-w-0 min-h-0 overflow-hidden">
                    
                    <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 shrink-0">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Manajemen Aktivitas & Proyek</h1>
                            <p className="text-muted-foreground mt-1">Lacak bulanan tim menggunakan Kanban Board atau Timeline.</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <div className="flex items-center bg-white p-1 rounded-lg border shadow-sm">
                                <Button variant={filter === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('all')} className="text-xs h-8">
                                    Semua Tugas
                                </Button>
                                <Button variant={filter === 'me' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('me')} className="text-xs h-8">
                                    <Filter className="size-3 mr-2" /> Assign Tasks
                                </Button>
                            </div>

                            <div className="flex items-center bg-white p-1 rounded-lg border shadow-sm">
                                <Button variant={viewMode === 'board' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('board')} className="text-xs h-8">
                                    <LayoutGrid className="size-4 mr-1.5" /> Board
                                </Button>
                                <Button variant={viewMode === 'timeline' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('timeline')} className="text-xs h-8">
                                    <CalendarDays className="size-4 mr-1.5" /> Timeline
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 overflow-hidden rounded-xl">
                        {viewMode === 'board' ? (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <div className="flex gap-6 h-full overflow-y-auto pb-4">
                                    {KANBAN_COLUMNS.map((column) => (
                                        <TaskColumn 
                                            key={column.id} column={column} tasks={columns[column.id] || []}
                                            currentUser={currentUser} permissions={permissions} employees={employees}
                                            onSelectTask={setSelectedTask} onAssignTask={handleAssign}
                                        />
                                    ))}
                                </div>
                            </DragDropContext>
                        ) : (
                            <TimelineView 
                                tasks={tasks} 
                                filteredTasks={filteredTasks} 
                                holidays={holidays} 
                                employees={employees}
                                canViewAll={permissions.includes('tasks.view_all_tasks')}
                                onSelectTask={setSelectedTask} 
                                
                            />
                        )}
                    </div>
                </div>
            </div>

            {selectedTask && (
                <TaskDetailModal 
                    task={selectedTask} 
                    currentUser={currentUser}
                    holidays={holidays}
                    onClose={() => setSelectedTask(null)} 
                />
            )}
        </AppLayout>
    );
}
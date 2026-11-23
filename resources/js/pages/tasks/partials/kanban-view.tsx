import { Droppable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeftRight } from 'lucide-react';
import TaskCard from './task-card'; 

export const KANBAN_COLUMNS = [
    { id: 'pending', title: 'To Do', color: 'border-l-4 border-l-slate-400' },
    { id: 'in_progress', title: 'In Progress', color: 'border-l-4 border-l-blue-500' },
    { id: 'completed', title: 'Done', color: 'border-l-4 border-l-emerald-500' }
];

export function TaskColumn({ column, tasks, currentUser, permissions, employees, onSelectTask, onAssignTask }: any) {
    return (
        <div className="flex flex-col flex-1 min-w-[300px] max-w-full bg-slate-100/60 rounded-xl p-4 border shadow-sm h-full overflow-hidden">
            
            {/* HEADER KOLOM */}
            <div className={`flex items-center justify-between pl-3 ${column.color} shrink-0`}>
                <h3 className="font-semibold text-foreground tracking-wide">{column.title}</h3>
                <Badge variant="secondary" className="font-mono">{tasks.length}</Badge>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 italic mt-2 mb-3 pl-3 select-none shrink-0">
                <ArrowLeftRight className="size-3" />
                <span>Tarik dan geser kartu</span>
            </div>

            {/* AREA KARTU TUGAS */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                        <div 
                            ref={provided.innerRef} 
                            {...provided.droppableProps} 
                            className={`flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar pr-2 pb-12 transition-colors rounded-lg ${snapshot.isDraggingOver ? 'bg-slate-200/50' : ''}`}
                        >
                            {tasks.map((task: any, index: number) => (
                                <TaskCard 
                                    key={task.id} task={task} index={index} currentUser={currentUser} permissions={permissions} 
                                    employees={employees} onSelect={onSelectTask} onAssign={onAssignTask}
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>

            {/* AREA TAMBAH TUGAS (Langsung buka Modal) */}
            <div className="mt-3 pt-3 border-t shrink-0">
                <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground hover:text-primary border border-transparent hover:border-primary/30 border-dashed transition-all bg-white/50" 
                    // Mengirimkan format dummy agar Modal tahu ini data baru (termasuk status kolomnya)
                    onClick={() => onSelectTask({ status: column.id })}
                >
                    <Plus className="size-4 mr-2" /> Tambah Tugas
                </Button>
            </div>
        </div>
    );
}
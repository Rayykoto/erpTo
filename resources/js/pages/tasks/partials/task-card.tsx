import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GripVertical, MessageSquare, Check, CheckCircle2, Clock, PlayCircle, KanbanSquare } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : '??';

export default function TaskCard({ task, index, currentUser, permissions, employees, onSelect, onAssign }: any) {
    const isPastAssignee = task.past_assignees?.some((pa: any) => pa.id === currentUser.id);
    const isCurrentAssignee = task.assigned_to === currentUser.id;
    const isCreator = task.created_by === currentUser.id;
    const hasGlobalPerm = permissions.includes('tasks.assign');
    let canAssign = task.is_assignable ? (isCreator || hasGlobalPerm || isCurrentAssignee || isPastAssignee) : (isCreator || hasGlobalPerm);

    const isCompleted = task.status === 'completed';
    const isInProgress = task.status === 'in_progress';

    return (
        <Draggable draggableId={task.id.toString()} index={index}>
            {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.draggableProps} style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.9 : 1 }}>
                    <Card className={`group shadow-sm border-slate-200 hover:border-primary/40 transition-all ${snapshot.isDragging ? 'ring-2 ring-primary shadow-md scale-[1.02]' : ''}`}>
                        <CardContent className={`p-3 flex flex-col gap-2`}>
                            
                            {/* BAGIAN ATAS: Drag Handle, Badge Project/Brand, Judul */}
                            <div className="flex items-start gap-2">
                                <div {...provided.dragHandleProps} className="mt-0.5 -ml-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing">
                                    <GripVertical className="size-4" />
                                </div>
                                
                                <div className="flex-1 cursor-pointer min-w-0" onClick={() => onSelect(task)}>
                                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                        {task.brand && (
                                            <Badge className="text-[9px] px-1.5 py-0 leading-none h-4 bg-slate-800 hover:bg-slate-700">
                                                {task.brand}
                                            </Badge>
                                        )}
                                        {task.project && (
                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 leading-none h-4 text-slate-500 bg-slate-100">
                                                {task.project}
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    <h4 className={`font-medium text-sm leading-snug break-words ${isCompleted ? 'text-slate-600' : 'text-slate-800 group-hover:text-primary transition-colors'}`}>
                                        {task.title}
                                    </h4>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pl-5 mt-1.5">
                                
                                {/* KIRI: Ikon Deskripsi & Deadline */}
                                <div className="flex items-center gap-2.5">
                                    {task.description && (
                                        <MessageSquare className="size-3.5 text-slate-400 shrink-0" title="Ada Deskripsi" />
                                    )}
                                    
                                    {task.end_date && (
                                        <div className={`flex items-center gap-1 text-[10px] font-medium ${task.is_late && !isCompleted ? 'text-rose-500' : 'text-slate-500'}`} title="Tenggat Waktu">
                                            <Clock className="size-3 shrink-0" />
                                            <span>{new Date(task.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                    )}

                                    {task.is_late && !isCompleted && (
                                        <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 shrink-0">
                                            Telat
                                        </span>
                                    )}
                                </div>
                                
                                {/* KANAN: Status Badge & Avatar */}
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                    
                                    {/* Indikator Status Tugas */}
                                    {isCompleted ? (
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 leading-none h-4 text-emerald-600 border-emerald-200 bg-emerald-50 font-medium flex items-center gap-1">
                                            <CheckCircle2 className="size-2.5" /> Selesai
                                        </Badge>
                                    ) : isInProgress ? (
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 leading-none h-4 text-blue-600 border-blue-200 bg-blue-50 font-medium flex items-center gap-1">
                                            <PlayCircle className="size-2.5" /> Proses
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 leading-none h-4 text-slate-500 border-slate-200 bg-slate-50 font-medium flex items-center gap-1">
                                            <KanbanSquare className="size-2.5" /> Perencanaan
                                        </Badge>
                                    )}

                                    {/* Avatar Penugasan */}
                                    {canAssign ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="focus:outline-none rounded-full ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                                                {task.assignee ? (
                                                    <Avatar className="size-6 border border-slate-200 shadow-sm hover:border-primary transition-all">
                                                        <AvatarFallback className={`text-[9px] font-bold ${isCompleted ? 'bg-slate-100 text-slate-500' : 'bg-primary/10 text-primary'}`}>{getInitials(task.assignee.name)}</AvatarFallback>
                                                    </Avatar>
                                                ) : (
                                                    <Avatar className="size-6 border border-dashed border-slate-300 bg-slate-50 hover:border-primary transition-all">
                                                        <AvatarFallback className="text-[12px] text-slate-400 bg-transparent">+</AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">Tugaskan Ke</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onAssign(task.id, null)} className="cursor-pointer text-muted-foreground italic">Kosongkan (Unassigned)</DropdownMenuItem>
                                                {employees.map((emp: any) => (
                                                    <DropdownMenuItem key={emp.id} onClick={() => onAssign(task.id, emp.id)} className="flex items-center justify-between cursor-pointer">
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="size-5 border">
                                                                <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{getInitials(emp.name)}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm font-medium">{emp.name}</span>
                                                        </div>
                                                        {task.assigned_to === emp.id && <Check className="size-4 text-primary" />}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <Avatar className="size-6 border shadow-sm cursor-not-allowed opacity-80">
                                            <AvatarFallback className="text-[9px] bg-slate-100 text-slate-500 font-bold">{task.assignee ? getInitials(task.assignee.name) : '+'}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </Draggable>
    );
}
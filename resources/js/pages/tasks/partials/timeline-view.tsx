import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
    CheckCircle2, 
    Users, 
    ChevronDown, 
    ChevronUp, 
    Clock, 
    AlertCircle,
    KanbanSquare,
    PlayCircle,
    XCircle,
    CalendarOff,
    CalendarDays // Tambahkan icon kalender
} from 'lucide-react';

const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : '??';

export default function TimelineView({ tasks, filteredTasks, holidays = [], employees = [], canViewAll = false, onSelectTask }: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedUserId, setSelectedUserId] = useState<string>('all'); 
    
    const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
    
    const [selectedHeatmapDate, setSelectedHeatmapDate] = useState<string | null>(null);

    const toggleExpand = (taskId: string) => {
        setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    const getFormattedDateString = (date: Date) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
    };

    const todayStr = getFormattedDateString(today); 

    const getYearDaysRange = () => {
        const yearDays = [];
        for (let m = 0; m < 12; m++) {
            const daysInMonth = new Date(selectedYear, m + 1, 0).getDate();
            for (let d = 1; d <= daysInMonth; d++) {
                yearDays.push(new Date(selectedYear, m, d));
            }
        }
        return yearDays;
    };
    
    const baseDateRange = getYearDaysRange();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const paddedDates = useMemo(() => {
        if (!baseDateRange.length) return [];
        const start = new Date(baseDateRange[0]);
        start.setDate(start.getDate() - start.getDay()); 

        const end = new Date(baseDateRange[baseDateRange.length - 1]);
        end.setDate(end.getDate() + (6 - end.getDay())); 

        const dates = [];
        let current = new Date(start);
        while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }, [baseDateRange]);

    const monthLabels = useMemo(() => {
        const labels = [];
        let lastMonth = -1;
        const totalWeeks = Math.ceil(paddedDates.length / 7);
        
        for (let w = 0; w < totalWeeks; w++) {
            const weekStart = paddedDates[w * 7];
            const hasFirstDay = paddedDates.slice(w * 7, w * 7 + 7).find(d => d.getDate() === 1);
            
            if (w === 0 || hasFirstDay) {
                const displayMonth = hasFirstDay ? hasFirstDay.getMonth() : weekStart.getMonth();
                const displayYear = hasFirstDay ? hasFirstDay.getFullYear() : weekStart.getFullYear();
                
                // PERBAIKAN 1: Hanya tambahkan label jika bulan tersebut berada di tahun yang DIPILIH (selectedYear)
                if (displayMonth !== lastMonth && displayYear === selectedYear) {
                    labels.push({ month: displayMonth, weekIdx: w });
                    lastMonth = displayMonth;
                }
            }
        }
        return labels;
    }, [paddedDates, selectedYear]); // Tambahkan selectedYear sebagai dependency

    const getHolidayData = (dateStr: string) => {
        if (!holidays || holidays.length === 0) return null;
        return holidays.find((h: any) => h.date === dateStr || h.start_date === dateStr); 
    };
    
    const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

    const getTaskStartDate = (task: any) => task.start_date ? new Date(task.start_date) : (task.created_at ? new Date(task.created_at) : new Date());
    const getTaskEndDate = (task: any) => task.end_date ? new Date(task.end_date) : getTaskStartDate(task); 

    const isDateInTaskRange = (dateStr: string, task: any) => {
        const checkDate = new Date(dateStr).setHours(0,0,0,0);
        const start = new Date(getTaskStartDate(task)).setHours(0,0,0,0);
        const end = new Date(getTaskEndDate(task)).setHours(0,0,0,0);
        return checkDate >= start && checkDate <= end;
    };

    let displayTasks = selectedUserId !== 'all' ? tasks : filteredTasks;
    if (selectedUserId !== 'all') {
        displayTasks = displayTasks.filter((t: any) => {
            const targetId = selectedUserId.toString();
            return t.assigned_to?.toString() === targetId || t.assignee?.id?.toString() === targetId || t.created_by?.toString() === targetId;
        });
    }

    displayTasks = displayTasks.filter((task: any) => {
        const taskStart = new Date(getTaskStartDate(task)).setHours(0,0,0,0);
        const taskEnd = new Date(getTaskEndDate(task)).setHours(0,0,0,0);
        const yearStart = new Date(selectedYear, 0, 1).setHours(0,0,0,0);
        const yearEnd = new Date(selectedYear, 11, 31).setHours(23,59,59,999);
        
        return taskStart <= yearEnd && taskEnd >= yearStart;
    });

    const groupedTasksByDate = useMemo(() => {
        const grouped: Record<string, any[]> = {};
        displayTasks.forEach((task: any) => {
            let current = new Date(getTaskStartDate(task));
            const end = new Date(getTaskEndDate(task));
            
            const yearStart = new Date(selectedYear, 0, 1);
            const yearEnd = new Date(selectedYear, 11, 31);
            
            if (current < yearStart) current = new Date(yearStart);
            const actualEnd = end > yearEnd ? yearEnd : end;

            while (current <= actualEnd) {
                const dateStr = getFormattedDateString(current);
                if (!grouped[dateStr]) grouped[dateStr] = [];
                if (!grouped[dateStr].find((t:any) => t.id === task.id)) {
                    grouped[dateStr].push(task);
                }
                current.setDate(current.getDate() + 1);
            }
        });
        return Object.entries(grouped).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
    }, [displayTasks, selectedYear]);

    const activeDateToDisplay = selectedHeatmapDate || todayStr;
    const timelineData = groupedTasksByDate.filter(([dateStr]) => dateStr === activeDateToDisplay);

    const getHeatmapColor = (taskCount: number, hasHoliday: boolean, weekend: boolean, inRange: boolean) => {
        if (!inRange) return 'bg-transparent'; 
        if (taskCount === 0) {
            if (hasHoliday) return 'bg-rose-100 dark:bg-rose-950/30'; 
            if (weekend) return 'bg-slate-100/50 dark:bg-slate-800/30';
            return 'bg-slate-100 dark:bg-slate-800'; 
        }
        if (taskCount === 1) return 'bg-[#9be9a8] dark:bg-[#0e4429]';
        if (taskCount === 2) return 'bg-[#40c463] dark:bg-[#006d32]';
        if (taskCount >= 3) return 'bg-[#30a14e] dark:bg-[#26a641]';
        return 'bg-[#216e39] dark:bg-[#39d353]'; 
    };

    return (
        <div className="bg-white shadow-sm w-full h-full flex flex-col rounded-lg border border-border overflow-hidden">
            
            <div className="p-4 bg-slate-50 border-b flex flex-wrap justify-between items-center shrink-0 gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-sm text-slate-700">📅 Rentang Waktu: 1 Tahun</span>
                    
                    <select className="text-sm border-slate-300 rounded-md shadow-sm px-3 py-1.5 bg-white focus:ring-primary focus:border-primary" value={selectedYear} onChange={(e) => {
                        const newYear = Number(e.target.value);
                        setSelectedYear(newYear);
                        const defaultDate = newYear === today.getFullYear() ? todayStr : `${newYear}-01-01`;
                        setSelectedHeatmapDate(defaultDate);
                    }}>
                        {[today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>

                    {canViewAll && employees.length > 0 && (
                        <>
                            <div className="w-px h-6 bg-slate-300 mx-1"></div>
                            <Users className="size-4 text-slate-500" />
                            <select 
                                className="text-sm border-slate-300 rounded-md shadow-sm px-3 py-1.5 bg-white cursor-pointer focus:ring-primary focus:border-primary max-w-[200px] truncate"
                                value={selectedUserId}
                                onChange={(e) => {
                                    setSelectedUserId(e.target.value);
                                    setSelectedHeatmapDate(todayStr); 
                                }}
                            >
                                <option value="all">Semua Karyawan</option>
                                {employees.map((emp: any) => (
                                    <option key={emp.id} value={emp.id.toString()}>{emp.name}</option>
                                ))}
                            </select>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar w-full">
                
                <div className="space-y-4 w-full">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-slate-800">
                            {displayTasks.length} tugas ditemukan pada tahun {selectedYear}
                        </h2>
                    </div>
                    
                    <Card className="border-border shadow-sm w-full overflow-hidden">
                        <CardContent className="p-5 overflow-x-auto w-full">
                            <div className="flex gap-2 min-w-max">
                                
                                <div className="flex flex-col gap-[6px] text-[10px] text-slate-400 dark:text-slate-500 pr-2 pt-[20px] text-right font-medium font-sans">
                                    <div className="h-[13px]"></div>
                                    <div className="h-[13px] leading-[13px]">Mon</div>
                                    <div className="h-[13px]"></div>
                                    <div className="h-[13px] leading-[13px]">Wed</div>
                                    <div className="h-[13px]"></div>
                                    <div className="h-[13px] leading-[13px]">Fri</div>
                                    <div className="h-[13px]"></div>
                                </div>

                                <div className="flex flex-col relative w-full">
                                    <div className="h-[20px] relative w-full text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                                        {monthLabels.map(label => (
                                            <span 
                                                key={`${label.weekIdx}-${label.month}`} 
                                                className="absolute top-0" 
                                                style={{ left: `${label.weekIdx * 20.5}px` }} 
                                            >
                                                {monthNames[label.month]}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="grid grid-rows-7 grid-flow-col gap-[6px]">
                                        {paddedDates.map((date, idx) => {
                                            const dateStr = getFormattedDateString(date);
                                            const holiday = getHolidayData(dateStr); 
                                            const hasHoliday = !!holiday;
                                            const weekend = isWeekend(date);
                                            const inRange = date.getFullYear() === selectedYear;
                                            
                                            const tasksForDay = inRange ? displayTasks.filter((t: any) => isDateInTaskRange(dateStr, t)) : [];
                                            const taskCount = tasksForDay.length;

                                            let tooltipText = '';
                                            if (inRange) {
                                                if (holiday) tooltipText += `🏖️ ${holiday.name || 'Hari Libur'}`;
                                                if (taskCount > 0) tooltipText += (tooltipText ? ' | ' : '') + `${taskCount} Tugas Aktif`;
                                                if (taskCount === 0 && !holiday) tooltipText = 'Kosong';
                                                tooltipText = `${date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}\n${tooltipText}`;
                                            }

                                            const isSelected = selectedHeatmapDate 
                                                ? selectedHeatmapDate === dateStr 
                                                : dateStr === todayStr;

                                            return (
                                                <div 
                                                    key={idx}
                                                    title={tooltipText}
                                                    onClick={() => {
                                                        if (inRange) {
                                                            setSelectedHeatmapDate(dateStr); 
                                                        }
                                                    }}
                                                    className={`size-[13px] rounded-[3px] transition-all duration-200 
                                                        ${inRange ? 'cursor-pointer hover:ring-2 hover:ring-primary' : ''} 
                                                        ${isSelected && inRange ? 'ring-2 ring-primary ring-offset-1 scale-110 shadow-sm z-10 relative' : ''}
                                                        ${getHeatmapColor(taskCount, hasHoliday, weekend, inRange)}
                                                    `}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center mt-5 text-[11px] text-slate-500 font-sans">
                                <span>Klik kotak untuk melihat tugas di tanggal tersebut</span>
                                <div className="flex items-center gap-[6px]">
                                    <span className="flex items-center gap-1.5 mr-4"><div className="size-[11px] rounded-[2px] bg-rose-100" /> Libur</span>
                                    <span className="mr-1">Less</span>
                                    <div className="size-[11px] rounded-[2px] bg-slate-100 dark:bg-slate-800" />
                                    <div className="size-[11px] rounded-[2px] bg-[#9be9a8] dark:bg-[#0e4429]" />
                                    <div className="size-[11px] rounded-[2px] bg-[#40c463] dark:bg-[#006d32]" />
                                    <div className="size-[11px] rounded-[2px] bg-[#30a14e] dark:bg-[#26a641]" />
                                    <span className="ml-1">More</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="w-full pb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-base font-semibold text-slate-800">
                            Aktivitas Tanggal {new Date(activeDateToDisplay).toLocaleDateString('id-ID', {day: 'numeric', month:'long', year:'numeric'})}
                            {activeDateToDisplay === todayStr && <span className="text-slate-500 font-normal ml-2">(Hari Ini)</span>}
                        </h2>
                        
                        {activeDateToDisplay !== todayStr && selectedYear === today.getFullYear() && (
                            <Button variant="outline" size="sm" onClick={() => setSelectedHeatmapDate(todayStr)} className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                                <XCircle className="size-3.5 mr-1" /> Kembali ke Hari Ini
                            </Button>
                        )}
                    </div>

                    {timelineData.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            <CalendarOff className="size-8 mx-auto mb-2 text-slate-300" />
                            Tidak ada aktivitas tugas pada tanggal ini.
                        </div>
                    ) : (
                        <div className="space-y-8 w-full">
                            {timelineData.map(([dateStr, dayTasks], groupIdx) => {
                                return (
                                    <div key={groupIdx} className="relative w-full">
                                        <div className="space-y-6 w-full">
                                            {dayTasks.map((task: any, idx: number) => {
                                                const isCompleted = task.status === 'completed';
                                                const isInProgress = task.status === 'in_progress';
                                                
                                                const startDateStr = getFormattedDateString(getTaskStartDate(task));
                                                const endDateStr = getFormattedDateString(getTaskEndDate(task));
                                                const isLate = !isCompleted && (endDateStr < todayStr);
                                                const isExpanded = !!expandedTasks[task.id];

                                                let iconColor = 'border-rose-400 text-rose-500 bg-rose-50';
                                                if (isCompleted) iconColor = 'border-emerald-500 text-emerald-500 bg-emerald-50';
                                                else if (isInProgress) iconColor = 'border-amber-500 text-amber-500 bg-amber-50';

                                                let badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
                                                let statusText = 'Belum Progress';
                                                if (isCompleted) {
                                                    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                                    statusText = 'Selesai';
                                                } else if (isInProgress) {
                                                    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
                                                    statusText = 'Sedang Proses';
                                                }

                                                return (
                                                    <div key={task.id} className="relative pl-10 pb-2 w-full">
                                                        
                                                        {idx !== dayTasks.length - 1 && (
                                                            <div className="absolute top-8 bottom-[-24px] left-[15px] w-[2px] bg-slate-200 -z-10"></div>
                                                        )}
                                                        
                                                        <div className={`absolute top-0 left-0 border-2 rounded-full p-1.5 shadow-sm z-10 ${iconColor}`}>
                                                            {isCompleted ? <CheckCircle2 className="size-4" /> : isInProgress ? <PlayCircle className="size-4" /> : <KanbanSquare className="size-4" />}
                                                        </div>

                                                        <div className={`bg-white border rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md w-full ${isExpanded ? 'ring-1 ring-primary/20' : ''}`}>
                                                            <div 
                                                                className="flex flex-col sm:flex-row justify-between sm:items-center p-4 cursor-pointer group gap-3"
                                                                onClick={() => toggleExpand(task.id)}
                                                            >
                                                                <div className="flex flex-col gap-1 overflow-hidden w-full">
                                                                    <div className="flex items-center gap-2">
                                                                        {task.brand && <Badge className="text-[10px] px-2 py-0.5 bg-slate-800 shrink-0">{task.brand}</Badge>}
                                                                        <span className="text-xs font-semibold text-primary uppercase truncate">{task.project || 'Umum'}</span>
                                                                        
                                                                        {/* PERBAIKAN 2: Tampilkan tanggal mulai tugas di header card (jika ada ruang) */}
                                                                        <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 ml-2">
                                                                            <CalendarDays className="size-3" />
                                                                            Dibuat: {new Date(startDateStr).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                                                        </span>
                                                                    </div>
                                                                    <h4 className={`text-sm sm:text-base font-medium group-hover:text-primary transition-colors truncate ${isCompleted ? 'text-slate-500' : 'text-slate-800'}`}>
                                                                        {task.title}
                                                                    </h4>
                                                                    
                                                                    {/* Tampilkan juga di mobile karena disembunyikan di atas */}
                                                                    <div className="sm:hidden flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                                                                        <CalendarDays className="size-3" />
                                                                        Dibuat: {new Date(startDateStr).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto mt-2 sm:mt-0">
                                                                    <Badge variant="outline" className={`text-[10px] px-2.5 py-0.5 whitespace-nowrap ${badgeStyle}`}>
                                                                        {statusText}
                                                                    </Badge>

                                                                    {isLate && <Badge variant="destructive" className="bg-rose-500 shadow-sm whitespace-nowrap"><AlertCircle className="size-3 mr-1"/> Telat</Badge>}
                                                                    
                                                                    <Button variant="ghost" size="icon" className={`h-8 w-8 transition-colors ${isExpanded ? 'bg-primary/10 text-primary' : 'text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-700 ml-1'}`}>
                                                                        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            {isExpanded && (
                                                                <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2 fade-in-50 duration-200">
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-2">
                                                                        <div>
                                                                            <span className="text-slate-500 text-xs block mb-1">Ditugaskan Kepada</span>
                                                                            {task.assignee ? (
                                                                                <div className="flex items-center gap-2">
                                                                                    <Avatar className="size-6 border"><AvatarFallback className="text-[10px]">{getInitials(task.assignee.name)}</AvatarFallback></Avatar>
                                                                                    <span className="font-medium text-slate-700">{task.assignee.name}</span>
                                                                                </div>
                                                                            ) : <span className="text-slate-400 italic">Belum ada PIC</span>}
                                                                        </div>
                                                                        
                                                                        <div className="flex flex-col sm:items-end">
                                                                            <span className="text-slate-500 text-xs block mb-1">Status Progres</span>
                                                                            <Badge variant="outline" className={`text-xs px-2 py-0.5 ${badgeStyle}`}>
                                                                                {statusText}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-200">
                                                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                            <Clock className="size-3"/> Estimasi Selesai: {new Date(endDateStr).toLocaleDateString('id-ID', {day: 'numeric', month:'long', year:'numeric'})}
                                                                        </span>
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="outline" 
                                                                            className="text-xs h-7 hover:text-primary hover:border-primary"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onSelectTask(task);
                                                                            }}
                                                                        >
                                                                            Lihat Detail Penuh
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
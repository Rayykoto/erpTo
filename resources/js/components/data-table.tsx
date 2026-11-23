import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Inbox, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export interface ColumnDef<T> {
    header: React.ReactNode;
    accessor?: keyof T;
    render?: (item: T, index: number) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    keyField?: keyof T;
    emptyMessage?: string;
    renderBulkActions?: (selectedIds: any[], clearSelection: () => void) => React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    keyField = 'id' as keyof T,
    emptyMessage = "Tidak ada data yang ditemukan.",
    renderBulkActions,
}: DataTableProps<T>) {
    const [selectedIds, setSelectedIds] = useState<any[]>([]);

    const showCheckboxes = !!renderBulkActions;
    const isAllSelected = data.length > 0 && selectedIds.length === data.length;
    // status "sebagian terpilih" untuk visual Checkbox yang lebih pro
    const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < data.length;
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(data.map((item) => item[keyField]));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: any) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const clearSelection = () => setSelectedIds([]);

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            
            {showCheckboxes && selectedIds.length > 0 && (
                <div className="bg-blue-50/80 border-b border-blue-100 px-4 py-2.5 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white shadow-none pointer-events-none rounded-md px-2 py-0.5">
                            {selectedIds.length} dipilih
                        </Badge>
                        <span className="text-sm font-medium text-blue-900 hidden sm:inline-block">
                            Pilih tindakan massal
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {renderBulkActions(selectedIds, clearSelection)}
                        <div className="h-4 w-px bg-blue-200 mx-1 hidden sm:block"></div>
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-blue-700 hover:bg-blue-200/50 hover:text-blue-800" 
                            onClick={clearSelection}
                            title="Batalkan Pilihan"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <Table>
                    {/* HEADER */}
                    <TableHeader className="bg-slate-50/80">
                        <TableRow className="hover:bg-transparent border-b-slate-200">
                            {showCheckboxes && (
                                <TableHead className="w-12 text-center align-middle">
                                    <div className="flex justify-center items-center h-full">
                                        <Checkbox
                                            checked={isAllSelected || (isPartiallySelected ? "indeterminate" : false)}
                                            onCheckedChange={handleSelectAll}
                                            aria-label="Pilih Semua"
                                        />
                                    </div>
                                </TableHead>
                            )}
                            {columns.map((col, idx) => (
                                <TableHead 
                                    key={idx} 
                                    className={`h-11 px-4 align-middle text-xs font-semibold uppercase tracking-wider text-slate-500 ${col.className || ''}`}
                                >
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    {/* BODY */}
                    <TableBody className="bg-white">
                        {data.map((item, rowIndex) => {
                            const id = item[keyField];
                            const isSelected = selectedIds.includes(id);

                            return (
                                <TableRow 
                                    key={id as string} 
                                    data-state={isSelected ? "selected" : undefined}
                                    className={`group transition-colors ${
                                        isSelected 
                                            ? 'bg-blue-50/40 hover:bg-blue-50/60' 
                                            : 'hover:bg-slate-50/80'
                                    }`}
                                >
                                    {showCheckboxes && (
                                        <TableCell className="px-4 py-3 align-middle text-center">
                                            <div className="flex justify-center items-center h-full">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => handleSelectOne(id)}
                                                    aria-label="Pilih Baris"
                                                />
                                            </div>
                                        </TableCell>
                                    )}
                                    {columns.map((col, colIndex) => (
                                        <TableCell 
                                            key={colIndex} 
                                            className={`px-4 py-3 align-middle text-slate-700 ${col.className || ''}`}
                                        >
                                            {col.render ? col.render(item, rowIndex) : item[col.accessor as keyof T]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                        
                        {/* STATE KOSONG */}
                        {data.length === 0 && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell 
                                    colSpan={showCheckboxes ? columns.length + 1 : columns.length} 
                                    className="h-48 text-center text-slate-500"
                                >
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                            <Inbox className="size-6 text-slate-400" />
                                        </div>
                                        <p className="text-sm font-medium mt-2">{emptyMessage}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
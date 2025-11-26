'use client';

import { useState, useMemo, Fragment } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Plus, Save, Undo2, RotateCcw, X } from 'lucide-react';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Types
interface TimeEntry {
    id: string;
    date: Date;
    arrivalTime: string;
    departureTime: string;
    workLocation: 'office' | 'remote';
    hasBreak: boolean;
    arrivalRemark: string;
    departureRemark: string;
}

interface AbsenceGroup {
    id: string;
    startDate: Date;
    endDate: Date;
    type: 'sickLeaveRequest' | 'school';
    entries: TimeEntry[];
}

// Demo Data
const generateDemoData = (): { entries: TimeEntry[]; absenceGroups: AbsenceGroup[] } => {
    const entries: TimeEntry[] = [
        // 05.11.2025 - 10.11.2025 | School period entries
        {
            id: '1',
            date: new Date(2025, 10, 11), // Di, 11.11.2025
            arrivalTime: '06:46',
            departureTime: '11:43',
            workLocation: 'remote',
            hasBreak: true,
            arrivalRemark: '',
            departureRemark: '',
        },
        {
            id: '2',
            date: new Date(2025, 10, 11), // Di, 11.11.2025 (second entry)
            arrivalTime: '12:13',
            departureTime: '15:31',
            workLocation: 'remote',
            hasBreak: false,
            arrivalRemark: '',
            departureRemark: '',
        },
        // 12.11.2025 - 14.11.2025 | School period entries
        {
            id: '3',
            date: new Date(2025, 10, 17), // Mo, 17.11.2025
            arrivalTime: '07:41',
            departureTime: '11:52',
            workLocation: 'office',
            hasBreak: true,
            arrivalRemark: '',
            departureRemark: '',
        },
        {
            id: '4',
            date: new Date(2025, 10, 17), // Mo, 17.11.2025 (second entry)
            arrivalTime: '12:22',
            departureTime: '15:58',
            workLocation: 'office',
            hasBreak: false,
            arrivalRemark: '',
            departureRemark: '',
        },
        {
            id: '5',
            date: new Date(2025, 10, 18), // Di, 18.11.2025
            arrivalTime: '06:46',
            departureTime: '12:03',
            workLocation: 'remote',
            hasBreak: true,
            arrivalRemark: '',
            departureRemark: '',
        },
        {
            id: '6',
            date: new Date(2025, 10, 18), // Di, 18.11.2025 (second entry)
            arrivalTime: '12:33',
            departureTime: '15:26',
            workLocation: 'remote',
            hasBreak: false,
            arrivalRemark: '',
            departureRemark: '',
        },
        // 19.11.2025 - 21.11.2025 | Sick Leave Request entries
        {
            id: '7',
            date: new Date(2025, 10, 24), // Mo, 24.11.2025
            arrivalTime: '07:34',
            departureTime: '12:24',
            workLocation: 'office',
            hasBreak: true,
            arrivalRemark: '',
            departureRemark: '',
        },
        {
            id: '8',
            date: new Date(2025, 10, 24), // Mo, 24.11.2025 (second entry)
            arrivalTime: '12:57',
            departureTime: '16:03',
            workLocation: 'office',
            hasBreak: false,
            arrivalRemark: '',
            departureRemark: '',
        },
        {
            id: '9',
            date: new Date(2025, 10, 25), // Di, 25.11.2025
            arrivalTime: '06:47',
            departureTime: '',
            workLocation: 'remote',
            hasBreak: false,
            arrivalRemark: '',
            departureRemark: '',
        },
        {
            id: '10',
            date: new Date(2025, 10, 25), // Di, 25.11.2025 (empty entry for second row)
            arrivalTime: '',
            departureTime: '',
            workLocation: 'office',
            hasBreak: false,
            arrivalRemark: '',
            departureRemark: '',
        },
    ];

    const absenceGroups: AbsenceGroup[] = [
        {
            id: 'absence-1',
            startDate: new Date(2025, 10, 3),
            endDate: new Date(2025, 10, 4),
            type: 'sickLeaveRequest',
            entries: [],
        },
        {
            id: 'absence-2',
            startDate: new Date(2025, 10, 5),
            endDate: new Date(2025, 10, 10),
            type: 'school',
            entries: entries.filter(e => e.id === '1' || e.id === '2'),
        },
        {
            id: 'absence-3',
            startDate: new Date(2025, 10, 12),
            endDate: new Date(2025, 10, 14),
            type: 'school',
            entries: entries.filter(e => ['3', '4', '5', '6'].includes(e.id)),
        },
        {
            id: 'absence-4',
            startDate: new Date(2025, 10, 19),
            endDate: new Date(2025, 10, 21),
            type: 'sickLeaveRequest',
            entries: entries.filter(e => ['7', '8', '9', '10'].includes(e.id)),
        },
    ];

    return { entries, absenceGroups };
};

export default function TimeRecordsPage() {
    const t = useTranslations('TimeRecordsPage');
    const format = useFormatter();

    // State
    const [startDate, setStartDate] = useState<Date>(new Date(2025, 10, 1));
    const [endDate, setEndDate] = useState<Date>(new Date(2025, 10, 30));
    const [entries, setEntries] = useState<TimeEntry[]>(() => generateDemoData().entries);
    const [absenceGroups] = useState<AbsenceGroup[]>(() => generateDemoData().absenceGroups);
    const [originalEntries, setOriginalEntries] = useState<TimeEntry[]>(() => generateDemoData().entries);
    const [hasChanges, setHasChanges] = useState(false);

    // Add entry dialog
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newEntry, setNewEntry] = useState<Partial<TimeEntry>>({
        date: new Date(),
        arrivalTime: '',
        departureTime: '',
        workLocation: 'office',
        hasBreak: false,
        arrivalRemark: '',
        departureRemark: '',
    });

    // Filter entries by date range
    const filteredAbsenceGroups = useMemo(() => {
        return absenceGroups.filter(group => {
            return isWithinInterval(group.startDate, { start: startOfDay(startDate), end: endOfDay(endDate) }) ||
                isWithinInterval(group.endDate, { start: startOfDay(startDate), end: endOfDay(endDate) }) ||
                (group.startDate <= startDate && group.endDate >= endDate);
        });
    }, [absenceGroups, startDate, endDate]);

    const formatDateRange = (start: Date, end: Date): string => {
        return `${format.dateTime(start, { day: '2-digit', month: '2-digit', year: 'numeric' })} - ${format.dateTime(end, { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    };

    const formatDate = (date: Date): string => {
        return format.dateTime(date, { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const handleEntryChange = (entryId: string, field: keyof TimeEntry, value: string | boolean) => {
        setEntries(prev => prev.map(entry => {
            if (entry.id === entryId) {
                return { ...entry, [field]: value };
            }
            return entry;
        }));
        setHasChanges(true);
    };

    const handleSave = () => {
        setOriginalEntries([...entries]);
        setHasChanges(false);
    };

    const handleDiscardChanges = () => {
        setEntries([...originalEntries]);
        setHasChanges(false);
    };

    const handleDeleteEntry = (entryId: string) => {
        setEntries(prev => prev.filter(entry => entry.id !== entryId));
        setHasChanges(true);
    };

    const handleAddEntry = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        const entry: TimeEntry = {
            id: newId,
            date: newEntry.date || new Date(),
            arrivalTime: newEntry.arrivalTime || '',
            departureTime: newEntry.departureTime || '',
            workLocation: newEntry.workLocation || 'office',
            hasBreak: newEntry.hasBreak || false,
            arrivalRemark: newEntry.arrivalRemark || '',
            departureRemark: newEntry.departureRemark || '',
        };
        setEntries(prev => [...prev, entry]);
        setHasChanges(true);
        setIsAddDialogOpen(false);
        setNewEntry({
            date: new Date(),
            arrivalTime: '',
            departureTime: '',
            workLocation: 'office',
            hasBreak: false,
            arrivalRemark: '',
            departureRemark: '',
        });
    };

    const getEntriesForGroup = (group: AbsenceGroup): TimeEntry[] => {
        return entries.filter(entry =>
            group.entries.some(ge => ge.id === entry.id)
        );
    };

    // Get entries that don't belong to any absence group (ungrouped entries)
    const ungroupedEntries = useMemo(() => {
        const groupedEntryIds = new Set(
            absenceGroups.flatMap(group => group.entries.map(e => e.id))
        );
        return entries.filter(entry =>
            !groupedEntryIds.has(entry.id) &&
            isWithinInterval(entry.date, { start: startOfDay(startDate), end: endOfDay(endDate) })
        );
    }, [entries, absenceGroups, startDate, endDate]);

    // Shared classes for transparent table inputs that only show borders on focus
    const tableInputClasses = "h-7 text-sm bg-transparent dark:bg-transparent hover:bg-input/50! border-transparent shadow-none focus:bg-background focus:border-input focus:shadow-xs";
    const tableSelectTriggerClasses = "h-7 text-sm bg-transparent dark:bg-transparent hover:bg-input/50 border-transparent shadow-none focus:bg-background focus:border-input focus:shadow-xs data-[state=open]:bg-background data-[state=open]:border-input data-[state=open]:shadow-xs";

    return (
        <div className="w-full space-y-4">
            {/* Header with controls */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t('period')}:</span>
                    <DatePicker
                        value={startDate}
                        onValueChange={(date) => date && setStartDate(date)}
                        className="w-[140px]"
                    />
                    <span>-</span>
                    <DatePicker
                        value={endDate}
                        onValueChange={(date) => date && setEndDate(date)}
                        className="w-[140px]"
                        disabledDates={{ before: startDate }}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-1" />
                        {t('addEntry')}
                    </Button>
                    <Button
                        variant={hasChanges ? "default" : "outline"}
                        onClick={handleSave}
                        disabled={!hasChanges}
                    >
                        <Save className="w-4 h-4 mr-1" />
                        {t('save')}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDiscardChanges}
                        disabled={!hasChanges}
                    >
                        <Undo2 className="w-4 h-4 mr-1" />
                        {t('discardChanges')}
                    </Button>
                </div>
            </div>

            {/* Time Records Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-8"></TableHead>
                            <TableHead>{t('table.date')}</TableHead>
                            <TableHead>{t('table.arrival')}</TableHead>
                            <TableHead>{t('table.workLocation')}</TableHead>
                            <TableHead>{t('table.remark')}</TableHead>
                            <TableHead>{t('table.date')}</TableHead>
                            <TableHead>{t('table.departure')}</TableHead>
                            <TableHead>{t('breaks.break')}</TableHead>
                            <TableHead>{t('table.remark')}</TableHead>
                            <TableHead className="w-10"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAbsenceGroups.length === 0 && ungroupedEntries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                                    {t('noRecords')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {filteredAbsenceGroups.map((group) => (
                                    <Fragment key={group.id}>
                                        {/* Group Header */}
                                        <TableRow key={`header-${group.id}`} className="bg-muted/30">
                                            <TableCell colSpan={10} className="font-medium">
                                                {formatDateRange(group.startDate, group.endDate)} | {t(`absenceTypes.${group.type}`)}
                                            </TableCell>
                                        </TableRow>
                                        {/* Group Entries */}
                                        {getEntriesForGroup(group).map((entry) => (
                                            <TableRow key={entry.id}>
                                                <TableCell className="text-center">
                                                    <RotateCcw className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(entry.date)}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="time"
                                                        value={entry.arrivalTime}
                                                        onChange={(e) => handleEntryChange(entry.id, 'arrivalTime', e.target.value)}
                                                        className={`w-24 ${tableInputClasses}`}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={entry.workLocation}
                                                        onValueChange={(value) => handleEntryChange(entry.id, 'workLocation', value)}
                                                    >
                                                        <SelectTrigger className={`w-28 ${tableSelectTriggerClasses}`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="office">{t('workLocations.office')}</SelectItem>
                                                            <SelectItem value="remote">{t('workLocations.remote')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={entry.arrivalRemark}
                                                        onChange={(e) => handleEntryChange(entry.id, 'arrivalRemark', e.target.value)}
                                                        className={`w-44 ${tableInputClasses}`}
                                                        placeholder={t('remarks.enterRemark')}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(entry.date)}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="time"
                                                        value={entry.departureTime}
                                                        onChange={(e) => handleEntryChange(entry.id, 'departureTime', e.target.value)}
                                                        className={`w-24 ${tableInputClasses}`}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Checkbox
                                                        className='mx-auto'
                                                        checked={entry.hasBreak}
                                                        onCheckedChange={(checked) => handleEntryChange(entry.id, 'hasBreak', checked === true)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={entry.departureRemark}
                                                        onChange={(e) => handleEntryChange(entry.id, 'departureRemark', e.target.value)}
                                                        className={`w-44 ${tableInputClasses}`}
                                                        placeholder={t('remarks.enterRemark')}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon-sm"
                                                                variant="ghost"
                                                                onClick={() => handleDeleteEntry(entry.id)}
                                                            >
                                                                <X
                                                                    className="text-destructive"
                                                                />
                                                                <span className="sr-only">{t('deleteEntry')}</span>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{t('deleteEntry')}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </Fragment>
                                ))}
                                {/* Ungrouped Entries */}
                                {ungroupedEntries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="text-center">
                                            <RotateCcw className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(entry.date)}
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="time"
                                                value={entry.arrivalTime}
                                                onChange={(e) => handleEntryChange(entry.id, 'arrivalTime', e.target.value)}
                                                className={`w-24 ${tableInputClasses}`}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={entry.workLocation}
                                                onValueChange={(value) => handleEntryChange(entry.id, 'workLocation', value)}
                                            >
                                                <SelectTrigger className={`w-28 ${tableSelectTriggerClasses}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="office">{t('workLocations.office')}</SelectItem>
                                                    <SelectItem value="remote">{t('workLocations.remote')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={entry.arrivalRemark}
                                                onChange={(e) => handleEntryChange(entry.id, 'arrivalRemark', e.target.value)}
                                                className={`w-44 ${tableInputClasses}`}
                                                placeholder={t('remarks.enterRemark')}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(entry.date)}
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="time"
                                                value={entry.departureTime}
                                                onChange={(e) => handleEntryChange(entry.id, 'departureTime', e.target.value)}
                                                className={`w-24 ${tableInputClasses}`}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Checkbox
                                                className='mx-auto'
                                                checked={entry.hasBreak}
                                                onCheckedChange={(checked) => handleEntryChange(entry.id, 'hasBreak', checked === true)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={entry.departureRemark}
                                                onChange={(e) => handleEntryChange(entry.id, 'departureRemark', e.target.value)}
                                                className={`w-44 ${tableInputClasses}`}
                                                placeholder={t('remarks.enterRemark')}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="icon-sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteEntry(entry.id)}
                                                    >
                                                        <X
                                                            className="text-destructive"
                                                        />
                                                        <span className="sr-only">{t('deleteEntry')}</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{t('deleteEntry')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add Entry Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t('addEntry')}</DialogTitle>
                        <DialogDescription>
                            {t('addEntry')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label>{t('table.date')}</Label>
                            <DatePicker
                                value={newEntry.date}
                                onValueChange={(date) => setNewEntry(prev => ({ ...prev, date }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>{t('table.arrival')}</Label>
                                <Input
                                    type="time"
                                    value={newEntry.arrivalTime}
                                    onChange={(e) => setNewEntry(prev => ({ ...prev, arrivalTime: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>{t('table.departure')}</Label>
                                <Input
                                    type="time"
                                    value={newEntry.departureTime}
                                    onChange={(e) => setNewEntry(prev => ({ ...prev, departureTime: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>{t('table.workLocation')}</Label>
                            <Select
                                value={newEntry.workLocation}
                                onValueChange={(value: 'office' | 'remote') => setNewEntry(prev => ({ ...prev, workLocation: value }))}
                            >
                                <SelectTrigger className='w-full'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="office">{t('workLocations.office')}</SelectItem>
                                    <SelectItem value="remote">{t('workLocations.remote')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="hasBreak"
                                checked={newEntry.hasBreak}
                                onCheckedChange={(checked) => setNewEntry(prev => ({ ...prev, hasBreak: checked === true }))}
                            />
                            <Label htmlFor="hasBreak">{t('breaks.break')}</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            {t('discardChanges')}
                        </Button>
                        <Button onClick={handleAddEntry}>
                            {t('addEntry')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
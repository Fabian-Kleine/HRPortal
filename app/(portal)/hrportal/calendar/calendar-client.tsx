'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    CalendarBody,
    CalendarDate,
    CalendarDatePagination,
    CalendarDatePicker,
    CalendarHeader,
    CalendarItem,
    CalendarMonthPicker,
    CalendarProvider,
    CalendarYearPicker,
    Feature,
    useCalendarYear
} from '@/components/ui/shadcn-io/calendar';
import { Textarea } from '@/components/ui/textarea';
import { startOfToday, isWithinInterval, startOfDay, endOfDay, differenceInCalendarDays, eachDayOfInterval, isWeekend } from 'date-fns';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { getHoldidaysInYear } from '@/lib/date';
import { EmployeeSettings } from '@prisma/client';

interface CalendarClientProps {
    employeeSettings: EmployeeSettings;
}

// Inner component that uses the calendar context
function CalendarContent({ employeeSettings }: CalendarClientProps) {
    const t = useTranslations('CalendarPage');
    const format = useFormatter();

    const [year] = useCalendarYear();

    // Holidays loaded from date-holidays library
    const [holidays, setHolidays] = useState<Feature[]>([]);

    const [features, setFeatures] = useState<Feature[]>([]);

    // Load holidays when year changes
    useEffect(() => {
        const rawHolidays = getHoldidaysInYear(year, employeeSettings.holidayRegion);
        const holidayFeatures: Feature[] = rawHolidays
            .filter(h => h.type === 'public')
            .map((holiday, index) => {
                const startDate = new Date(holiday.start);
                const endDate = new Date(new Date(holiday.end).getTime() - 1);
                return {
                    id: `holiday-${year}-${index}`,
                    name: holiday.name,
                    startAt: startDate,
                    endAt: endDate,
                    status: {
                        id: 'holiday',
                        name: t('absenceTypes.holiday'),
                        color: '#f59e0b', // Orange
                    }
                };
            });
        setHolidays(holidayFeatures);
    }, [year, employeeSettings.holidayRegion, t]);

    // Add/Edit Dialog State
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [absenceType, setAbsenceType] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    // Day Details Dialog State
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedDayFeatures, setSelectedDayFeatures] = useState<Feature[]>([]);

    const handleDayClick = (date: Date) => {
        const dayFeatures = features.filter(f =>
            isWithinInterval(date, {
                start: startOfDay(f.startAt),
                end: endOfDay(f.endAt)
            })
        );

        if (dayFeatures.length > 0) {
            setSelectedDate(date);
            setSelectedDayFeatures(dayFeatures);
            setIsDetailsDialogOpen(true);
        } else {
            openAddDialog(date);
        }
    };

    const openAddDialog = (date?: Date, feature?: Feature) => {
        if (feature) {
            setEditingFeatureId(feature.id);
            setStartDate(feature.startAt);
            setEndDate(feature.endAt);
            setAbsenceType(feature.status.id);
            setDescription(feature.name === feature.status.name ? '' : feature.name);
        } else {
            setEditingFeatureId(null);
            setStartDate(date);
            setEndDate(date);
            setAbsenceType('');
            setDescription('');
        }
        setIsAddDialogOpen(true);
    };

    const getAbsenceColor = (type: string) => {
        switch (type) {
            case 'vacation': return '#22c55e'; // Green
            case 'businessTrip': return '#3b82f6'; // Blue
            case 'sickLeave': return '#ef4444'; // Red
            default: return '#6b7280'; // Gray
        }
    };

    // Calculate total days in span
    const calculateTotalDays = (start: Date | undefined, end: Date | undefined): number => {
        if (!start || !end) return 0;
        return differenceInCalendarDays(end, start) + 1;
    };

    // Calculate workdays (excluding weekends)
    const calculateWorkdays = (start: Date | undefined, end: Date | undefined): number => {
        if (!start || !end) return 0;
        const days = eachDayOfInterval({ start, end });
        return days.filter(day => !isWeekend(day)).length;
    };

    // Calculate vacation days used (workdays minus holidays)
    const calculateVacationDays = (start: Date | undefined, end: Date | undefined): number => {
        if (!start || !end) return 0;
        const days = eachDayOfInterval({ start, end });
        return days.filter(day => {
            // Exclude weekends
            if (isWeekend(day)) return false;
            // Exclude holidays
            const isHoliday = holidays.some(holiday =>
                isWithinInterval(day, {
                    start: startOfDay(holiday.startAt),
                    end: endOfDay(holiday.endAt)
                })
            );
            return !isHoliday;
        }).length;
    };

    const totalDays = calculateTotalDays(startDate, endDate);
    const workdays = calculateWorkdays(startDate, endDate);
    const vacationDays = calculateVacationDays(startDate, endDate);

    const handleSave = () => {
        if (!startDate || !endDate || !absenceType) return;

        // Set times to start and end of day
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const newFeature: Feature = {
            id: editingFeatureId || Math.random().toString(36).substr(2, 9),
            name: description || t(`absenceTypes.${absenceType}`),
            startAt: start,
            endAt: end,
            status: {
                id: absenceType,
                name: t(`absenceTypes.${absenceType}`),
                color: getAbsenceColor(absenceType),
            }
        };

        if (editingFeatureId) {
            setFeatures(features.map(f => f.id === editingFeatureId ? newFeature : f));
            // Update details view if open
            if (isDetailsDialogOpen && selectedDate) {
                const updatedFeatures = features.map(f => f.id === editingFeatureId ? newFeature : f)
                    .filter(f => isWithinInterval(selectedDate, {
                        start: startOfDay(f.startAt),
                        end: endOfDay(f.endAt)
                    }));
                setSelectedDayFeatures(updatedFeatures);
            }
        } else {
            setFeatures([...features, newFeature]);
            // Update details view if open (e.g. adding new from details view)
            if (isDetailsDialogOpen && selectedDate) {
                if (isWithinInterval(selectedDate, {
                    start: startOfDay(newFeature.startAt),
                    end: endOfDay(newFeature.endAt)
                })) {
                    setSelectedDayFeatures(prev => [...prev, newFeature]);
                }
            }
        }
        setIsAddDialogOpen(false);
    };

    const handleDelete = (id: string) => {
        const newFeatures = features.filter(f => f.id !== id);
        setFeatures(newFeatures);
        if (selectedDate) {
            setSelectedDayFeatures(newFeatures.filter(f =>
                isWithinInterval(selectedDate, {
                    start: startOfDay(f.startAt),
                    end: endOfDay(f.endAt)
                })
            ));
        }
    };

    return (
        <>
            <CalendarDate>
                <CalendarDatePicker>
                    <CalendarMonthPicker />
                    <CalendarYearPicker end={new Date().getFullYear() + 10} start={new Date().getFullYear() - 10} />
                </CalendarDatePicker>
                <CalendarDatePagination />
            </CalendarDate>
            <CalendarHeader />
            <CalendarBody onDayClick={handleDayClick} features={[...holidays, ...features]}>
                {({ feature }) => <CalendarItem feature={feature} key={feature.id} />}
            </CalendarBody>

            {/* Add/Edit Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className='sm:max-w-xl'>
                    <DialogHeader>
                        <DialogTitle>{editingFeatureId ? t('dialog.editTitle') : t('dialog.title')}</DialogTitle>
                        <DialogDescription>
                            {editingFeatureId ? t('dialog.editDescription') : t('dialog.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>{t('form.startDate')}</Label>
                                <DatePicker
                                    value={startDate}
                                    onValueChange={setStartDate}
                                    disabledDates={{ before: startOfToday() }}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>{t('form.endDate')}</Label>
                                <DatePicker
                                    value={endDate}
                                    onValueChange={setEndDate}
                                    disabledDates={startDate ? { before: startDate } : { before: startOfToday() }}
                                />
                            </div>
                        </div>
                        {startDate && endDate && (
                            <div className="flex gap-4 p-3 bg-card/75 rounded-lg text-sm">
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground">{t('form.totalDays')}</span>
                                    <span className="font-medium">{totalDays}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground">{t('form.workdays')}</span>
                                    <span className="font-medium">{workdays}</span>
                                </div>
                                {absenceType === 'vacation' && (
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">{t('form.vacationDaysUsed')}</span>
                                        <span className="font-medium">{vacationDays}</span>
                                    </div>
                                )}
                                {absenceType === 'vacation' && (
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">{t('form.vacationDaysLeft')}</span>
                                        <span className="font-medium">{employeeSettings.vacationDays - vacationDays}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <Label>{t('form.type')}</Label>
                            <Select value={absenceType} onValueChange={setAbsenceType}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder={t('form.selectType')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vacation">{t('absenceTypes.vacation')}</SelectItem>
                                    <SelectItem value="businessTrip">{t('absenceTypes.businessTrip')}</SelectItem>
                                    <SelectItem value="sickLeave">{t('absenceTypes.sickLeave')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>{t('form.description')}</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('form.descriptionPlaceholder')}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            {t('actions.cancel')}
                        </Button>
                        <Button onClick={handleSave} disabled={!startDate || !endDate || !absenceType}>
                            {t('actions.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Day Details Dialog */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle>{selectedDate ? format.dateTime(selectedDate, { dateStyle: 'full' }) : ''}</DialogTitle>
                        <DialogDescription>
                            {t('details.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        {selectedDayFeatures.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">{t('details.noFeatures')}</p>
                        )}
                        {selectedDayFeatures.map(feature => (
                            <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: feature.status.color }} />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{feature.name}</span>
                                        <span className="text-xs text-muted-foreground">{feature.status.name}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" onClick={() => openAddDialog(undefined, feature)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(feature.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button className="w-full mt-2" onClick={() => openAddDialog(selectedDate || new Date())}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('actions.add')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function CalendarClient({ employeeSettings }: CalendarClientProps) {
    return (
        <div className="w-full">
            <CalendarProvider>
                <CalendarContent employeeSettings={employeeSettings} />
            </CalendarProvider>
        </div>
    );
}

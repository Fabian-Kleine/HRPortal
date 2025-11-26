import Holidays from 'date-holidays';

interface WorkingHoursParams {
    year?: number;
    month?: number; // 1-12
    dailyWorkHours?: number;
    region: string; // e.g., 'US', 'GB', 'DE'
}

export function calculateMonthlyWorkingHours({
    year = new Date().getFullYear(),
    month = new Date().getMonth() + 1,
    dailyWorkHours = 8,
    region,
}: WorkingHoursParams): number {
    const hd = new Holidays(region);
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingHours = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();

        // Check if it's a weekday (Monday = 1, Friday = 5)
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

        // Check if it's a holiday
        const isHoliday = hd.isHoliday(date);

        if (isWeekday && !isHoliday) {
            workingHours += dailyWorkHours;
        }
    }

    return workingHours;
}

export function getHoldidaysInYear(year: number, region: string) {
    const hd = new Holidays(region);

    const holidays = hd.getHolidays(year);

    return holidays;
}

export function hourDecimalToHoursMinutes(decimalHours: number): { hours: number; minutes: number } {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return { hours, minutes };
}
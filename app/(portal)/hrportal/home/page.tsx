import { ChartRadialText } from "@/components/charts/chart-radial-text";
import SessionTerminal from "@/components/session-terminal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { getEmployeeSettings } from "@/lib/db";
import { calculateMonthlyWorkingHours, hourDecimalToHoursMinutes } from "@/lib/date";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
    const session = await auth();
    const t = await getTranslations("HomePage");

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const employeeSettings = await getEmployeeSettings(session.user.id);

    const overtimeMinutes = 103;
    const overtime = hourDecimalToHoursMinutes(overtimeMinutes / 60);
    const monthlyWorkingHours = calculateMonthlyWorkingHours({ dailyWorkHours: employeeSettings.dailyHours, region: employeeSettings.holidayRegion });
    const totalWorkedHours = hourDecimalToHoursMinutes(monthlyWorkingHours + overtimeMinutes / 60);

    return (
        <div className="grid grid-cols-4 grid-rows-2 gap-4 p-4">
            <Card className="col-span-2 row-span-1">
                <CardHeader>
                    <CardTitle>{t('terminal.title')}</CardTitle>
                    <CardDescription className="sr-only">{t('terminal.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <SessionTerminal employeeSettings={employeeSettings} />
                </CardContent>
            </Card>
            <Card className="col-span-2 row-span-1">
                <CardHeader>
                    <CardTitle>{t('vacation.title')}</CardTitle>
                    <CardDescription className="sr-only">{t('vacation.description')}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between">
                    <div className="space-y-2">
                        <div>
                            <p className="text-muted-foreground text-sm">{t('vacation.entitlement')}</p>
                            <p className="font-medium">{employeeSettings.vacationDays} {t('vacation.days')}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">{t('vacation.taken')}</p>
                            <p className="font-medium">12 {t('vacation.days')}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">{t('vacation.planned')}</p>
                            <p className="font-medium">0 {t('vacation.days')}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">{t('vacation.remaining')}</p>
                            <p className="font-medium">18 {t('vacation.days')}</p>
                        </div>
                    </div>
                    <ChartRadialText
                        chartConfig={{
                            vacation: {
                                label: t('vacation.chartLabel'),
                                color: "var(--primary)"
                            }
                        }}
                        chartData={[
                            { vacation: 18 / employeeSettings.vacationDays * 100 }
                        ]}
                        dataKey="vacation"
                        text={{ value: "18", label: t('vacation.daysLeft') }}
                        className="ml-auto mx-0"
                    />
                </CardContent>
            </Card>
            <Card className="col-span-2 row-span-1">
                <CardHeader>
                    <CardTitle>{t('timeaccounts.title')}</CardTitle>
                    <CardDescription className="sr-only">{t('timeaccounts.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {employeeSettings.hasFlextime ? (
                        <>
                            <div className="flex justify-between">
                                <p>{t('timeaccounts.flextime')}</p>
                                <p>{`${overtime.hours}:${overtime.minutes}`} h</p>
                            </div>
                            <Separator className="my-2" />
                        </>
                    ) : null}
                    <div className="flex justify-between">
                        <p>{t('timeaccounts.worktime')}</p>
                        <p>{`${totalWorkedHours.hours}:${totalWorkedHours.minutes}`} h</p>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between">
                        <p>{t('timeaccounts.targettime')}</p>
                        <p>{monthlyWorkingHours} h</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

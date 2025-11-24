import { ChartRadialText } from "@/components/charts/chart-radial-text";
import SessionTerminal from "@/components/session-terminal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
    const t = await getTranslations("HomePage");

    return (
        <div className="grid grid-cols-4 grid-rows-2 gap-4 p-4">
            <Card className="col-span-2 row-span-1">
                <CardHeader>
                    <CardTitle>{t('terminal.title')}</CardTitle>
                    <CardDescription>{t('terminal.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <SessionTerminal />
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
                            <p className="font-medium">30 {t('vacation.days')}</p>
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
                            { vacation: 18 / 30 * 100 }
                        ]}
                        dataKey="vacation"
                        text={{ value: "18", label: t('vacation.daysLeft') }}
                        className="ml-auto mx-0"
                    />
                </CardContent>
            </Card>
        </div>
    )
}

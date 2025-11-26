"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { EmployeeSettings } from "@prisma/client";
import { Building2, House, Pause, Play, Square } from "lucide-react";
import { useTranslations, useFormatter, type DateTimeFormatOptions } from "next-intl";
import { useState, useEffect } from "react";

type ActivityStatus = 'active' | 'break' | 'inactive';
type WorkLocation = 'inOffice' | 'remote';

function getAcitivityColorClass(activity: ActivityStatus, location: WorkLocation) {
    switch (activity) {
        case 'active':
            return location === 'inOffice' ? 'bg-green-500' : 'bg-blue-500';
        case 'break':
            return 'bg-yellow-500';
        case 'inactive':
        default:
            return 'bg-red-500';
    }
}

const dateOptions: DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    year: 'numeric'
};

const timeOptions: DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
};

interface SessionTerminalProps {
    employeeSettings: EmployeeSettings;
}

export default function SessionTerminal({ employeeSettings }: SessionTerminalProps) {
    const t = useTranslations("HomePage");
    const f = useFormatter();

    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [acitivity, setActivity] = useState<ActivityStatus>('inactive');
    const [workLocation, setWorkLocation] = useState<WorkLocation>('inOffice');
    const [activeSince, setActiveSince] = useState<Date>(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute (60000ms)

        return () => clearInterval(interval);
    }, []);

    return (
        <Item>
            <div className={cn("h-24 w-1", getAcitivityColorClass(acitivity, workLocation))} />
            <ItemContent>
                <ItemTitle className="text-2xl">{f.dateTime(currentTime, timeOptions)}</ItemTitle>
                <ItemDescription>{f.dateTime(currentTime, dateOptions)}</ItemDescription>
                <ItemDescription>{t(`terminal.${acitivity}`, { location: t(`terminal.${workLocation}`), time: f.dateTime(activeSince, timeOptions) })}</ItemDescription>
            </ItemContent>
            <ItemActions className="flex-col items-end">
                <ButtonGroup>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={acitivity === 'active' ? "default" : "outline"}
                                size="lg"
                                className="rounded-md"
                                onClick={() => {
                                    setActivity('active');
                                    setActiveSince(new Date());
                                }}
                                disabled={acitivity === 'active'}
                            >
                                <Play />
                                <span className="sr-only">{t('terminal.startWorkday')}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('terminal.startWorkday')}</p>
                        </TooltipContent>
                    </Tooltip>
                    <ButtonGroupSeparator />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={acitivity === 'break' ? "default" : "outline"}
                                size="lg"
                                className="rounded-md"
                                onClick={() => setActivity('break')}
                                disabled={acitivity === 'break' || acitivity === 'inactive'}
                            >
                                <Pause />
                                <span className="sr-only">{t('terminal.pause')}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('terminal.pause')}</p>
                        </TooltipContent>
                    </Tooltip>
                    <ButtonGroupSeparator />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={acitivity === 'inactive' ? "default" : "outline"}
                                size="lg"
                                className="rounded-md"
                                onClick={() => setActivity('inactive')}
                                disabled={acitivity === 'inactive'}
                            >
                                <Square />
                                <span className="sr-only">{t('terminal.endWorkday')}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('terminal.endWorkday')}</p>
                        </TooltipContent>
                    </Tooltip>
                </ButtonGroup>
                {employeeSettings.canWorkRemote && (
                    <ButtonGroup>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={workLocation === 'inOffice' ? "default" : "outline"}
                                    size="lg"
                                    className="rounded-md"
                                    onClick={() => setWorkLocation('inOffice')}
                                    disabled={workLocation === 'inOffice' || acitivity === 'active'}
                                >
                                    <Building2 />
                                    <span className="sr-only">{t('terminal.inOffice')}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('terminal.inOffice')}</p>
                            </TooltipContent>
                        </Tooltip>
                        <ButtonGroupSeparator />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={workLocation === 'remote' ? "default" : "outline"}
                                    size="lg"
                                    className="rounded-md"
                                    onClick={() => setWorkLocation('remote')}
                                    disabled={workLocation === 'remote' || acitivity === 'active'}
                                >
                                    <House />
                                    <span className="sr-only">{t('terminal.remote')}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('terminal.remote')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </ButtonGroup>
                )}
            </ItemActions>
        </Item>
    );
}
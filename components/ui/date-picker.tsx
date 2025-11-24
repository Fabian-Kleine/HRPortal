"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { Matcher } from "react-day-picker"

export interface DatePickerProps {
    value?: Date
    onValueChange?: (date: Date | undefined) => void
    placeholder?: string
    className?: string
    disabled?: boolean
    disabledDates?: Matcher | Matcher[]
}

export function DatePicker({
    value,
    onValueChange,
    placeholder = "Select date",
    className,
    disabled = false,
    disabledDates
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn("rounded-md", className)}
                    disabled={disabled}
                >
                    {value ? value.toLocaleDateString() : placeholder}
                    <ChevronDownIcon className="ml-auto" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    captionLayout="dropdown"
                    disabled={disabledDates}
                    onSelect={(date) => {
                        onValueChange?.(date)
                        setOpen(false)
                    }}
                />
            </PopoverContent>
        </Popover>
    )
}

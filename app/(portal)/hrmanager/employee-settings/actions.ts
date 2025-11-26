"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type DefaultEmployeeSettings = Awaited<ReturnType<typeof getDefaultEmployeeSettings>>

// GET default employee settings
export async function getDefaultEmployeeSettings() {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
        throw new Error("Unauthorized")
    }

    // Find or create default settings
    let defaultSettings = await prisma.employeeSettings.findFirst({
        where: { isDefault: true },
    })

    if (!defaultSettings) {
        // Create default settings if they don't exist
        defaultSettings = await prisma.employeeSettings.create({
            data: {
                isDefault: true,
                vacationDays: 30,
                dailyHours: 8,
                hasFlextime: false,
                holidayRegion: "DE",
                minBreakTime: 30,
                canWorkRemote: false,
                canSelfApprove: false,
            },
        })
    }

    return defaultSettings
}

// UPDATE default employee settings
export async function updateDefaultEmployeeSettings(data: {
    vacationDays?: number
    dailyHours?: number
    hasFlextime?: boolean
    holidayRegion?: string
    minBreakTime?: number
    canWorkRemote?: boolean
    canSelfApprove?: boolean
}) {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
        throw new Error("Unauthorized")
    }

    const {
        vacationDays,
        dailyHours,
        hasFlextime,
        holidayRegion,
        minBreakTime,
        canWorkRemote,
        canSelfApprove,
    } = data

    // Find existing default settings
    let defaultSettings = await prisma.employeeSettings.findFirst({
        where: { isDefault: true },
    })

    if (defaultSettings) {
        // Update existing default settings
        defaultSettings = await prisma.employeeSettings.update({
            where: { id: defaultSettings.id },
            data: {
                vacationDays: vacationDays ?? 30,
                dailyHours: dailyHours ?? 8,
                hasFlextime: hasFlextime ?? false,
                holidayRegion: holidayRegion ?? "DE",
                minBreakTime: minBreakTime ?? 30,
                canWorkRemote: canWorkRemote ?? false,
                canSelfApprove: canSelfApprove ?? false,
            },
        })
    } else {
        // Create default settings if they don't exist
        defaultSettings = await prisma.employeeSettings.create({
            data: {
                isDefault: true,
                vacationDays: vacationDays ?? 30,
                dailyHours: dailyHours ?? 8,
                hasFlextime: hasFlextime ?? false,
                holidayRegion: holidayRegion ?? "DE",
                minBreakTime: minBreakTime ?? 30,
                canWorkRemote: canWorkRemote ?? false,
                canSelfApprove: canSelfApprove ?? false,
            },
        })
    }

    revalidatePath("/hrmanager/employee-settings")

    return defaultSettings
}

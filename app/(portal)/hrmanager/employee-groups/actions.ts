"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type EmployeeGroupWithRelations = Awaited<ReturnType<typeof getEmployeeGroups>>[number]

// GET all employee groups
export async function getEmployeeGroups() {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
        throw new Error("Unauthorized")
    }

    const groups = await prisma.employeeGroup.findMany({
        include: {
            settings: true,
            _count: {
                select: { employees: true },
            },
        },
        orderBy: {
            name: "asc",
        },
    })

    return groups
}

// GET single employee group
export async function getEmployeeGroup(id: string) {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
        throw new Error("Unauthorized")
    }

    const group = await prisma.employeeGroup.findUnique({
        where: { id },
        include: {
            settings: true,
            employees: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    employeeNumber: true,
                },
            },
            _count: {
                select: { employees: true },
            },
        },
    })

    if (!group) {
        throw new Error("Employee group not found")
    }

    return group
}

// CREATE new employee group
export async function createEmployeeGroup(data: {
    name: string
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
        name,
        vacationDays,
        dailyHours,
        hasFlextime,
        holidayRegion,
        minBreakTime,
        canWorkRemote,
        canSelfApprove,
    } = data

    // Create group with settings
    const group = await prisma.employeeGroup.create({
        data: {
            name,
            settings: {
                create: {
                    vacationDays: vacationDays ?? 30,
                    dailyHours: dailyHours ?? 8,
                    hasFlextime: hasFlextime ?? false,
                    holidayRegion: holidayRegion ?? "DE",
                    minBreakTime: minBreakTime ?? 30,
                    canWorkRemote: canWorkRemote ?? false,
                    canSelfApprove: canSelfApprove ?? false,
                },
            },
        },
        include: {
            settings: true,
            _count: {
                select: { employees: true },
            },
        },
    })

    revalidatePath("/hrmanager/employee-groups")

    return group
}

// UPDATE employee group
export async function updateEmployeeGroup(
    id: string,
    data: {
        name?: string
        vacationDays?: number
        dailyHours?: number
        hasFlextime?: boolean
        holidayRegion?: string
        minBreakTime?: number
        canWorkRemote?: boolean
        canSelfApprove?: boolean
    }
) {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
        throw new Error("Unauthorized")
    }

    const {
        name,
        vacationDays,
        dailyHours,
        hasFlextime,
        holidayRegion,
        minBreakTime,
        canWorkRemote,
        canSelfApprove,
    } = data

    // Get current group to check for existing settings
    const currentGroup = await prisma.employeeGroup.findUnique({
        where: { id },
        include: { settings: true },
    })

    if (!currentGroup) {
        throw new Error("Employee group not found")
    }

    // Update or create settings
    if (currentGroup.settings) {
        await prisma.employeeSettings.update({
            where: { id: currentGroup.settings.id },
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
    }

    const group = await prisma.employeeGroup.update({
        where: { id },
        data: {
            name,
            ...((!currentGroup.settings) && {
                settings: {
                    create: {
                        vacationDays: vacationDays ?? 30,
                        dailyHours: dailyHours ?? 8,
                        hasFlextime: hasFlextime ?? false,
                        holidayRegion: holidayRegion ?? "DE",
                        minBreakTime: minBreakTime ?? 30,
                        canWorkRemote: canWorkRemote ?? false,
                        canSelfApprove: canSelfApprove ?? false,
                    },
                },
            }),
        },
        include: {
            settings: true,
            _count: {
                select: { employees: true },
            },
        },
    })

    revalidatePath("/hrmanager/employee-groups")

    return group
}

// DELETE employee group
export async function deleteEmployeeGroup(id: string) {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
        throw new Error("Unauthorized")
    }

    // Get the group with its settings
    const group = await prisma.employeeGroup.findUnique({
        where: { id },
        include: { settings: true },
    })

    if (!group) {
        throw new Error("Employee group not found")
    }

    // Delete the group (this will unlink employees due to SetNull)
    await prisma.employeeGroup.delete({
        where: { id },
    })

    // Delete the settings if they exist
    if (group.settings) {
        await prisma.employeeSettings.delete({
            where: { id: group.settings.id },
        })
    }

    revalidatePath("/hrmanager/employee-groups")

    return { success: true }
}

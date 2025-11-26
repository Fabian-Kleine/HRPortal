"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type EmployeeWithRelations = Awaited<ReturnType<typeof getEmployees>>[number]

// GET all employees
export async function getEmployees() {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
        redirect("/");
    }

    const employees = await prisma.employee.findMany({
        include: {
            group: true,
            settings: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    // Remove passwords from response
    return employees.map(({ password: _, ...employee }) => employee)
}

// GET single employee
export async function getEmployee(id: string) {
    const session = await auth()
    
    if (!session?.user?.isAdmin && session?.user?.id !== id) {
        redirect("/");
    }

    const employee = await prisma.employee.findUnique({
        where: { id },
        include: {
            group: {
                include: {
                    settings: true,
                },
            },
            settings: true,
        },
    })

    if (!employee) {
        throw new Error("Employee not found")
    }

    // Remove password from response
    const { password: _, ...employeeWithoutPassword } = employee
    return employeeWithoutPassword
}

// CREATE new employee
export async function createEmployee(data: {
    name: string
    employeeNumber: string
    email: string
    password: string
    isAdmin?: boolean
    groupId?: string | null
    // Optional individual settings
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
        redirect("/");
    }

    const {
        name,
        employeeNumber,
        email,
        password,
        isAdmin,
        groupId,
        vacationDays,
        dailyHours,
        hasFlextime,
        holidayRegion,
        minBreakTime,
        canWorkRemote,
        canSelfApprove,
    } = data

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Check if individual settings are provided
    const hasCustomSettings = 
        vacationDays !== undefined ||
        dailyHours !== undefined ||
        hasFlextime !== undefined ||
        holidayRegion !== undefined ||
        minBreakTime !== undefined ||
        canWorkRemote !== undefined ||
        canSelfApprove !== undefined

    // Create employee - first without settings
    const employee = await prisma.employee.create({
        data: {
            name,
            employeeNumber,
            email,
            password: hashedPassword,
            isAdmin: isAdmin ?? false,
            ...(groupId && {
                group: { connect: { id: groupId } },
            }),
            ...(hasCustomSettings && {
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
            group: true,
            settings: true,
        },
    })

    revalidatePath("/hrmanager/employees")

    // Remove password from response
    const { password: _, ...employeeWithoutPassword } = employee
    return employeeWithoutPassword
}

// UPDATE employee
export async function updateEmployee(
    id: string,
    data: {
        name?: string
        employeeNumber?: string
        email?: string
        isAdmin?: boolean
        groupId?: string | null
        // Optional individual settings
        vacationDays?: number
        dailyHours?: number
        hasFlextime?: boolean
        holidayRegion?: string
        minBreakTime?: number
        canWorkRemote?: boolean
        canSelfApprove?: boolean
        // Flag to indicate if custom settings should be used
        useCustomSettings?: boolean
    }
) {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
        redirect("/");
    }

    const {
        name,
        employeeNumber,
        email,
        isAdmin,
        groupId,
        vacationDays,
        dailyHours,
        hasFlextime,
        holidayRegion,
        minBreakTime,
        canWorkRemote,
        canSelfApprove,
        useCustomSettings,
    } = data

    // Get current employee to check for existing settings
    const currentEmployee = await prisma.employee.findUnique({
        where: { id },
        include: { settings: true },
    })

    if (!currentEmployee) {
        throw new Error("Employee not found")
    }

    // Handle settings first
    if (useCustomSettings) {
        if (currentEmployee.settings) {
            // Update existing settings
            await prisma.employeeSettings.update({
                where: { id: currentEmployee.settings.id },
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
            // Create new settings and link to employee
            const newSettings = await prisma.employeeSettings.create({
                data: {
                    vacationDays: vacationDays ?? 30,
                    dailyHours: dailyHours ?? 8,
                    hasFlextime: hasFlextime ?? false,
                    holidayRegion: holidayRegion ?? "DE",
                    minBreakTime: minBreakTime ?? 30,
                    canWorkRemote: canWorkRemote ?? false,
                    canSelfApprove: canSelfApprove ?? false,
                    employee: { connect: { id } },
                },
            })
        }
    } else if (currentEmployee.settings) {
        // Remove custom settings if they exist and useCustomSettings is false
        await prisma.employeeSettings.delete({
            where: { id: currentEmployee.settings.id },
        })
    }

    // Now update the employee (without settings, since we handled it above)
    const employee = await prisma.employee.update({
        where: { id },
        data: {
            name,
            employeeNumber,
            email,
            isAdmin,
            ...(groupId 
                ? { group: { connect: { id: groupId } } }
                : { group: { disconnect: true } }
            ),
        },
        include: {
            group: true,
            settings: true,
        },
    })

    revalidatePath("/hrmanager/employees")

    // Remove password from response
    const { password: _, ...employeeWithoutPassword } = employee
    return employeeWithoutPassword
}

// DELETE employee
export async function deleteEmployee(id: string) {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
        redirect("/");
    }

    // First delete associated settings if they exist
    const employee = await prisma.employee.findUnique({
        where: { id },
        include: { settings: true },
    })

    if (!employee) {
        throw new Error("Employee not found")
    }

    if (employee.settings) {
        await prisma.employeeSettings.delete({
            where: { id: employee.settings.id },
        })
    }

    await prisma.employee.delete({
        where: { id },
    })

    revalidatePath("/hrmanager/employees")

    return { success: true }
}

// RESET password
export async function resetEmployeePassword(id: string, newPassword: string) {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
        redirect("/");
    }

    if (!newPassword) {
        throw new Error("New password is required")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.employee.update({
        where: { id },
        data: { password: hashedPassword },
    })

    return { success: true }
}

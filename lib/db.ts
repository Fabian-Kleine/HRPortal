import { PrismaClient, EmployeeSettings } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { cache } from "react";

const prismaClientSingleton = () => {
    return new PrismaClient().$extends(withAccelerate());
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma: PrismaClientSingleton = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const getDefaultEmployeeSettings = cache(async () => {
    return await prisma.employeeSettings.findFirst({
        where: { isDefault: true },
    });
});

export const getEmployeeSettings = cache(async (employeeId: string): Promise<EmployeeSettings> => {
    const defaultSettings = await getDefaultEmployeeSettings();

    const employeeAndGroupSettings = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: {
            settings: true,
            group: {
                include: {
                    settings: true,
                }
            }
        }
    });

    // Merge settings with priority: employee > group > default
    const mergedSettings = {
        ...defaultSettings,
        ...employeeAndGroupSettings?.group?.settings,
        ...employeeAndGroupSettings?.settings,
    };

    // Remove null values by falling back to next priority level
    const finalSettings = Object.keys(mergedSettings).reduce((acc, key) => {
        const employeeValue = employeeAndGroupSettings?.settings?.[key as keyof typeof employeeAndGroupSettings.settings];
        const groupValue = employeeAndGroupSettings?.group?.settings?.[key as keyof typeof employeeAndGroupSettings.group.settings];
        const defaultValue = defaultSettings?.[key as keyof typeof defaultSettings];
        
        (acc as any)[key] = employeeValue ?? groupValue ?? defaultValue;
        return acc;
    }, {} as EmployeeSettings);

    return finalSettings;
});
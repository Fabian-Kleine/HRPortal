import { PrismaPostgresAdapter } from '@prisma/adapter-ppg'
import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const connectionString = process.env.DATABASE_URL || "";

const prisma = new PrismaClient({
    adapter: new PrismaPostgresAdapter({
        connectionString,
    })
})

async function main() {
    console.log("🌱 Starting seed...")

    // Create default employee settings
    const defaultSettings = await prisma.employeeSettings.upsert({
        where: { id: "default-settings" },
        update: {},
        create: {
            id: "default-settings",
            isDefault: true,
            vacationDays: 30,
            dailyHours: 8,
            hasFlextime: true,
            holidayRegion: "DE-NW",
            minBreakTime: 30,
            canWorkRemote: true,
            canSelfApprove: false,
        },
    })

    console.log("✅ Created default settings:", defaultSettings.id)

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 12)

    const adminEmployee = await prisma.employee.upsert({
        where: { email: "admin@company.com" },
        update: {},
        create: {
            employeeNumber: "EMP-001",
            name: "Admin User",
            email: "admin@company.com",
            password: hashedPassword,
            isAdmin: true,
        },
    })

    console.log("✅ Created admin employee:", adminEmployee.email)

    // Create a sample employee group
    const engineeringGroup = await prisma.employeeGroup.upsert({
        where: { name: "Engineering" },
        update: {},
        create: {
            name: "Engineering",
            settings: {
                create: {
                    vacationDays: 30,
                    dailyHours: 8,
                    hasFlextime: true,
                    holidayRegion: "DE-NW",
                    minBreakTime: 30,
                    canWorkRemote: true,
                    canSelfApprove: false,
                },
            },
        },
    })

    console.log("✅ Created employee group:", engineeringGroup.name)

    // Create a sample regular employee
    const regularEmployee = await prisma.employee.upsert({
        where: { email: "john.doe@company.com" },
        update: {},
        create: {
            employeeNumber: "EMP-002",
            name: "John Doe",
            email: "john.doe@company.com",
            password: await bcrypt.hash("password123", 12),
            isAdmin: false,
            groupId: engineeringGroup.id,
        },
    })

    console.log("✅ Created regular employee:", regularEmployee.email)

    console.log("\n🎉 Seed completed successfully!")
    console.log("\n📋 Login credentials:")
    console.log("   Admin: admin@company.com / admin123")
    console.log("   User:  john.doe@company.com / password123")
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

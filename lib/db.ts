import { PrismaClient } from "@prisma/client/edge";
import { PrismaPostgresAdapter } from '@prisma/adapter-ppg'

const connectionString = process.env.DATABASE_URL || "";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
 
export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter: new PrismaPostgresAdapter({
        connectionString,
    })
});
 
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
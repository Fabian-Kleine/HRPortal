import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import type { Adapter } from "next-auth/adapters"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma) as Adapter,
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const employee = await prisma.employee.findUnique({
                    where: { email: credentials.email as string }
                })

                if (!employee) {
                    return null
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    employee.password
                )

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: employee.id,
                    email: employee.email,
                    name: employee.name,
                    isAdmin: employee.isAdmin,
                    employeeNumber: employee.employeeNumber,
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id ?? ""
                token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false
                token.employeeNumber = (user as { employeeNumber?: string }).employeeNumber ?? ""
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.isAdmin = token.isAdmin as boolean
                session.user.employeeNumber = token.employeeNumber as string
            }
            return session
        }
    },
    pages: {
        signIn: "/",
    },
    session: {
        strategy: "jwt",
        maxAge: 12 * 60 * 60, // 12 hours
    },
})
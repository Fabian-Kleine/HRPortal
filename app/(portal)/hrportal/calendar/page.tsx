import { auth } from "@/lib/auth";
import { getEmployeeSettings } from "@/lib/db";
import CalendarClient from "./calendar-client";
import { redirect } from "next/navigation";

export default async function CalendarPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    const employeeSettings = await getEmployeeSettings(session.user.id);

    return <CalendarClient employeeSettings={employeeSettings} />;
}
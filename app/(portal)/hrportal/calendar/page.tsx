import { auth } from "@/lib/auth";
import { getEmployeeSettings } from "@/lib/db";
import CalendarClient from "./calendar-client";

export default async function CalendarPage() {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const employeeSettings = await getEmployeeSettings(session.user.id);

    return <CalendarClient employeeSettings={employeeSettings} />;
}
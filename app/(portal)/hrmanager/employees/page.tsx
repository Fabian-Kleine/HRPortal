import { getEmployees } from "./actions";
import { getEmployeeGroups } from "../employee-groups/actions";
import { getDefaultEmployeeSettings } from "../employee-settings/actions";
import { EmployeesClient } from "./employees-client";
import type { UserGroup, EmployeeSettingsData } from "@/types/employee";

export default async function EmployeesPage() {
  const [employees, groupsData, defaultSettingsData] = await Promise.all([
    getEmployees(),
    getEmployeeGroups(),
    getDefaultEmployeeSettings(),
  ]);

  // Convert groups to UserGroup type
  const groups: UserGroup[] = groupsData.map((group) => ({
    id: group.id,
    name: group.name,
    vacationDays: group.settings?.vacationDays ?? 30,
    dailyHours: group.settings?.dailyHours ?? 8,
    hasFlextime: group.settings?.hasFlextime ?? false,
    holidayRegion: group.settings?.holidayRegion ?? "DE",
    minBreakTime: group.settings?.minBreakTime ?? 30,
    canWorkRemote: group.settings?.canWorkRemote ?? false,
    canSelfApprove: group.settings?.canSelfApprove ?? false,
  }));

  // Convert default settings
  const defaultSettings: EmployeeSettingsData = {
    vacationDays: defaultSettingsData.vacationDays,
    dailyHours: defaultSettingsData.dailyHours,
    hasFlextime: defaultSettingsData.hasFlextime,
    holidayRegion: defaultSettingsData.holidayRegion,
    minBreakTime: defaultSettingsData.minBreakTime,
    canWorkRemote: defaultSettingsData.canWorkRemote,
    canSelfApprove: defaultSettingsData.canSelfApprove,
  };

  return (
    <EmployeesClient 
      initialEmployees={employees} 
      groups={groups} 
      defaultSettings={defaultSettings} 
    />
  );
}
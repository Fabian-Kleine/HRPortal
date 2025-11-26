import { getEmployeeGroups } from "./actions";
import { getDefaultEmployeeSettings } from "../employee-settings/actions";
import { EmployeeGroupsClient } from "./employee-groups-client";
import type { EmployeeSettings } from "@/types/employee";

export default async function EmployeeGroupsPage() {
  const [groups, defaultSettingsData] = await Promise.all([
    getEmployeeGroups(),
    getDefaultEmployeeSettings(),
  ]);

  // Convert default settings
  const defaultSettings: EmployeeSettings = {
    vacationDays: defaultSettingsData.vacationDays,
    dailyHours: defaultSettingsData.dailyHours,
    hasFlextime: defaultSettingsData.hasFlextime,
    holidayRegion: defaultSettingsData.holidayRegion,
    minBreakTime: defaultSettingsData.minBreakTime,
    canWorkRemote: defaultSettingsData.canWorkRemote,
    canSelfApprove: defaultSettingsData.canSelfApprove,
  };

  return (
    <EmployeeGroupsClient 
      initialGroups={groups} 
      defaultSettings={defaultSettings} 
    />
  );
}
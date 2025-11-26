import { getDefaultEmployeeSettings } from "./actions";
import { EmployeeSettingsClient } from "./employee-settings-client";

export default async function SettingsPage() {
  const defaultSettings = await getDefaultEmployeeSettings();

  return <EmployeeSettingsClient initialSettings={defaultSettings} />;
}
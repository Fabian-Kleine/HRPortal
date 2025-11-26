"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { EmployeeSettingsForm } from "@/components/hr-manager/employee-settings-form";
import type { EmployeeSettings } from "@/types/employee";
import { updateDefaultEmployeeSettings, type DefaultEmployeeSettings } from "./actions";

// Default fallback settings
const fallbackDefaults: EmployeeSettings = {
  vacationDays: 30,
  dailyHours: 8,
  hasFlextime: true,
  holidayRegion: "DE-NW",
  minBreakTime: 30,
  canWorkRemote: true,
  canSelfApprove: false,
};

interface EmployeeSettingsClientProps {
  initialSettings: DefaultEmployeeSettings;
}

export function EmployeeSettingsClient({ initialSettings }: EmployeeSettingsClientProps) {
  const t = useTranslations("HRManager.settings");
  const [isPending, startTransition] = useTransition();
  
  // Convert to EmployeeSettings type
  const initialEmployeeSettings: EmployeeSettings = {
    vacationDays: initialSettings.vacationDays,
    dailyHours: initialSettings.dailyHours,
    hasFlextime: initialSettings.hasFlextime,
    holidayRegion: initialSettings.holidayRegion,
    minBreakTime: initialSettings.minBreakTime,
    canWorkRemote: initialSettings.canWorkRemote,
    canSelfApprove: initialSettings.canSelfApprove,
  };
  
  const [settings, setSettings] = useState<EmployeeSettings>(initialEmployeeSettings);
  const [savedSettings, setSavedSettings] = useState<EmployeeSettings>(initialEmployeeSettings);

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const handleSave = async () => {
    startTransition(async () => {
      try {
        const updated = await updateDefaultEmployeeSettings(settings);
        const updatedSettings: EmployeeSettings = {
          vacationDays: updated.vacationDays,
          dailyHours: updated.dailyHours,
          hasFlextime: updated.hasFlextime,
          holidayRegion: updated.holidayRegion,
          minBreakTime: updated.minBreakTime,
          canWorkRemote: updated.canWorkRemote,
          canSelfApprove: updated.canSelfApprove,
        };
        setSavedSettings(updatedSettings);
        setSettings(updatedSettings);
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    });
  };

  const handleReset = () => {
    setSettings(savedSettings);
  };

  const handleResetToDefaults = () => {
    setSettings(fallbackDefaults);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeSettingsForm settings={settings} onChange={setSettings} disabled={isPending} />
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResetToDefaults}
              disabled={isPending}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t("resetToDefaults")}
            </Button>
            {hasChanges && (
              <Button variant="ghost" onClick={handleReset} disabled={isPending}>
                {t("discardChanges")}
              </Button>
            )}
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || isPending}>
            <Save className="h-4 w-4 mr-2" />
            {isPending ? t("saving") : t("save")}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("hierarchy.title")}</CardTitle>
          <CardDescription>
            {t("hierarchy.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">{t("hierarchy.default")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("hierarchy.defaultDescription")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">{t("hierarchy.group")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("hierarchy.groupDescription")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">{t("hierarchy.individual")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("hierarchy.individualDescription")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

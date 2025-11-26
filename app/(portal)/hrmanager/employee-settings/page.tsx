"use client";

import { useState } from "react";
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

// Default settings - in real app, would be fetched from API
const defaultSettings: EmployeeSettings = {
  vacationDays: 30,
  dailyHours: 8,
  hasFlextime: true,
  holidayRegion: "DE-NW",
  minBreakTime: 30,
  canWorkRemote: true,
  canSelfApprove: false,
};

export default function SettingsPage() {
  const t = useTranslations("HRManager.settings");
  const [settings, setSettings] = useState<EmployeeSettings>(defaultSettings);
  const [savedSettings, setSavedSettings] = useState<EmployeeSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSavedSettings(settings);
    setIsSaving(false);
    // In real app, would save to API
    console.log("Saved settings:", settings);
  };

  const handleReset = () => {
    setSettings(savedSettings);
  };

  const handleResetToDefaults = () => {
    setSettings(defaultSettings);
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
          <EmployeeSettingsForm settings={settings} onChange={setSettings} />
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResetToDefaults}
              disabled={isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t("resetToDefaults")}
            </Button>
            {hasChanges && (
              <Button variant="ghost" onClick={handleReset} disabled={isSaving}>
                {t("discardChanges")}
              </Button>
            )}
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? t("saving") : t("save")}
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
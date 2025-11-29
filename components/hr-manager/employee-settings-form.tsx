"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import { HolidayRegionSelector } from "./holiday-region-selector";
import type { EmployeeSettingsData } from "@/types/employee";

interface EmployeeSettingsFormProps {
  settings: EmployeeSettingsData;
  onChange: (settings: EmployeeSettingsData) => void;
  disabled?: boolean;
}

export function EmployeeSettingsForm({
  settings,
  onChange,
  disabled = false,
}: EmployeeSettingsFormProps) {
  const t = useTranslations("HRManager.settings");
  
  const updateField = <K extends keyof EmployeeSettingsData>(
    field: K,
    value: EmployeeSettingsData[K]
  ) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <FieldGroup>
      <Field orientation="vertical">
        <FieldLabel htmlFor="vacationDays">{t("vacationDays")}</FieldLabel>
        <FieldDescription>
          {t("vacationDaysDescription")}
        </FieldDescription>
        <Input
          id="vacationDays"
          type="number"
          min={0}
          value={settings.vacationDays}
          onChange={(e) =>
            updateField("vacationDays", parseInt(e.target.value) || 0)
          }
          disabled={disabled}
        />
      </Field>

      <Field orientation="vertical">
        <FieldLabel htmlFor="dailyHours">{t("dailyHours")}</FieldLabel>
        <FieldDescription>
          {t("dailyHoursDescription")}
        </FieldDescription>
        <Input
          id="dailyHours"
          type="number"
          min={0}
          max={24}
          step={0.5}
          value={settings.dailyHours}
          onChange={(e) =>
            updateField("dailyHours", parseFloat(e.target.value) || 0)
          }
          disabled={disabled}
        />
      </Field>

      <Field orientation="vertical">
        <FieldLabel htmlFor="minBreakTime">{t("minBreakTime")}</FieldLabel>
        <FieldDescription>
          {t("minBreakTimeDescription")}
        </FieldDescription>
        <Input
          id="minBreakTime"
          type="number"
          min={0}
          value={settings.minBreakTime}
          onChange={(e) =>
            updateField("minBreakTime", parseInt(e.target.value) || 0)
          }
          disabled={disabled}
        />
      </Field>

      <HolidayRegionSelector
        value={settings.holidayRegion}
        onChange={(value) => updateField("holidayRegion", value)}
        disabled={disabled}
      />

      <Field orientation="horizontal">
        <Checkbox
          id="hasFlextime"
          checked={settings.hasFlextime}
          onCheckedChange={(checked) =>
            updateField("hasFlextime", checked === true)
          }
          disabled={disabled}
        />
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="hasFlextime">{t("hasFlextime")}</FieldLabel>
          <FieldDescription>
            {t("hasFlextimeDescription")}
          </FieldDescription>
        </div>
      </Field>

      <Field orientation="horizontal">
        <Checkbox
          id="canWorkRemote"
          checked={settings.canWorkRemote}
          onCheckedChange={(checked) =>
            updateField("canWorkRemote", checked === true)
          }
          disabled={disabled}
        />
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="canWorkRemote">{t("canWorkRemote")}</FieldLabel>
          <FieldDescription>
            {t("canWorkRemoteDescription")}
          </FieldDescription>
        </div>
      </Field>

      <Field orientation="horizontal">
        <Checkbox
          id="canSelfApprove"
          checked={settings.canSelfApprove}
          onCheckedChange={(checked) =>
            updateField("canSelfApprove", checked === true)
          }
          disabled={disabled}
        />
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="canSelfApprove">{t("canSelfApprove")}</FieldLabel>
          <FieldDescription>
            {t("canSelfApproveDescription")}
          </FieldDescription>
        </div>
      </Field>
    </FieldGroup>
  );
}

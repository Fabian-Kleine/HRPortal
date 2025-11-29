"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { EmployeeSettingsForm } from "./employee-settings-form";
import { type UserGroup, type EmployeeSettingsData } from "@/types/employee";

interface UserGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: UserGroup;
  defaultSettings: EmployeeSettingsData;
  onSave: (group: Omit<UserGroup, "id"> & { id?: string }) => void;
}

export function UserGroupDialog({
  open,
  onOpenChange,
  group,
  defaultSettings,
  onSave,
}: UserGroupDialogProps) {
  const t = useTranslations("HRManager.groups.dialog");
  const isEdit = !!group;

  const [formData, setFormData] = useState<Omit<UserGroup, "id"> & { id?: string }>(() => ({
    id: group?.id,
    name: group?.name ?? "",
    ...defaultSettings,
    ...(group ? {
      vacationDays: group.vacationDays,
      dailyHours: group.dailyHours,
      hasFlextime: group.hasFlextime,
      holidayRegion: group.holidayRegion,
      minBreakTime: group.minBreakTime,
      canWorkRemote: group.canWorkRemote,
      canSelfApprove: group.canSelfApprove,
    } : {}),
  }));

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open) {
      setFormData({
        id: group?.id,
        name: group?.name ?? "",
        ...defaultSettings,
        ...(group ? {
          vacationDays: group.vacationDays,
          dailyHours: group.dailyHours,
          hasFlextime: group.hasFlextime,
          holidayRegion: group.holidayRegion,
          minBreakTime: group.minBreakTime,
          canWorkRemote: group.canWorkRemote,
          canSelfApprove: group.canSelfApprove,
        } : {}),
      });
    }
  }, [open, group, defaultSettings]);

  const handleSettingsChange = (settings: EmployeeSettingsData) => {
    setFormData((prev) => ({ ...prev, ...settings }));
  };

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("editTitle") : t("addTitle")}</DialogTitle>
          <DialogDescription>
            {isEdit ? t("editDescription") : t("addDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Group Information Section */}
          <div>
            <h3 className="text-sm font-medium mb-4">{t("groupInfo")}</h3>
            <FieldGroup>
              <Field orientation="vertical">
                <FieldLabel htmlFor="groupName">{t("name")}</FieldLabel>
                <Input
                  id="groupName"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={t("namePlaceholder")}
                />
              </Field>
            </FieldGroup>
          </div>

          <FieldSeparator />

          {/* Group Settings Section */}
          <div>
            <h3 className="text-sm font-medium mb-4">{t("groupSettings")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("groupSettingsDescription")}
            </p>
            <EmployeeSettingsForm
              settings={{
                vacationDays: formData.vacationDays,
                dailyHours: formData.dailyHours,
                hasFlextime: formData.hasFlextime,
                holidayRegion: formData.holidayRegion,
                minBreakTime: formData.minBreakTime,
                canWorkRemote: formData.canWorkRemote,
                canSelfApprove: formData.canSelfApprove,
              }}
              onChange={handleSettingsChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? t("save") : t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

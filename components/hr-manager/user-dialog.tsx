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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { EmployeeSettingsForm } from "./employee-settings-form";
import { type User, type UserGroup, type EmployeeSettings } from "@/types/employee";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  groups: UserGroup[];
  defaultSettings: EmployeeSettings;
  onSave: (user: Omit<User, "id"> & { id?: string; password?: string }) => void;
  onResetPassword?: (userId: string) => void;
}

const emptySettings: EmployeeSettings = {
  vacationDays: 30,
  dailyHours: 8,
  hasFlextime: false,
  holidayRegion: "DE",
  minBreakTime: 30,
  canWorkRemote: false,
  canSelfApprove: false,
};

export function UserDialog({
  open,
  onOpenChange,
  user,
  groups,
  defaultSettings,
  onSave,
  onResetPassword,
}: UserDialogProps) {
  const t = useTranslations("HRManager.employees.dialog");
  const isEdit = !!user;
  
  // Check if user has custom settings (different from defaults)
  const hasCustomSettings = user ? (
    user.vacationDays !== undefined ||
    user.dailyHours !== undefined ||
    user.hasFlextime !== undefined ||
    user.holidayRegion !== undefined ||
    user.minBreakTime !== undefined ||
    user.canWorkRemote !== undefined ||
    user.canSelfApprove !== undefined
  ) : false;
  
  const [overrideSettings, setOverrideSettings] = useState(hasCustomSettings);
  
  const [formData, setFormData] = useState<Omit<User, "id"> & { id?: string; password?: string }>(() => ({
    id: user?.id,
    name: user?.name ?? "",
    employeeNumber: user?.employeeNumber ?? "",
    email: user?.email ?? "",
    password: "",
    isAdmin: user?.isAdmin ?? false,
    groupId: user?.groupId,
    ...defaultSettings,
    ...(user ? {
      vacationDays: user.vacationDays,
      dailyHours: user.dailyHours,
      hasFlextime: user.hasFlextime,
      holidayRegion: user.holidayRegion,
      minBreakTime: user.minBreakTime,
      canWorkRemote: user.canWorkRemote,
      canSelfApprove: user.canSelfApprove,
    } : {}),
  }));

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open) {
      const userHasCustom = user ? (
        user.vacationDays !== undefined ||
        user.dailyHours !== undefined ||
        user.hasFlextime !== undefined ||
        user.holidayRegion !== undefined ||
        user.minBreakTime !== undefined ||
        user.canWorkRemote !== undefined ||
        user.canSelfApprove !== undefined
      ) : false;
      
      setOverrideSettings(userHasCustom);
      setFormData({
        id: user?.id,
        name: user?.name ?? "",
        employeeNumber: user?.employeeNumber ?? "",
        email: user?.email ?? "",
        password: "",
        isAdmin: user?.isAdmin ?? false,
        groupId: user?.groupId,
        ...defaultSettings,
        ...(user ? {
          vacationDays: user.vacationDays,
          dailyHours: user.dailyHours,
          hasFlextime: user.hasFlextime,
          holidayRegion: user.holidayRegion,
          minBreakTime: user.minBreakTime,
          canWorkRemote: user.canWorkRemote,
          canSelfApprove: user.canSelfApprove,
        } : {}),
      });
    }
  }, [open, user, defaultSettings]);

  const handleSettingsChange = (settings: EmployeeSettings) => {
    setFormData((prev) => ({ ...prev, ...settings }));
  };

  const handleSave = () => {
    // If not overriding settings, remove the custom settings from formData
    if (!overrideSettings) {
      const { vacationDays, dailyHours, hasFlextime, holidayRegion, minBreakTime, canWorkRemote, canSelfApprove, ...rest } = formData;
      onSave(rest as Omit<User, "id"> & { id?: string; password?: string });
    } else {
      onSave(formData);
    }
    onOpenChange(false);
  };

  const handleResetPassword = () => {
    if (user && onResetPassword) {
      onResetPassword(user.id);
    }
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
          {/* User Information Section */}
          <div>
            <h3 className="text-sm font-medium mb-4">{t("personalInfo")}</h3>
            <FieldGroup>
              <Field orientation="vertical">
                <FieldLabel htmlFor="name">{t("name")}</FieldLabel>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={t("namePlaceholder")}
                />
              </Field>

              <Field orientation="vertical">
                <FieldLabel htmlFor="employeeNumber">{t("employeeNumber")}</FieldLabel>
                <Input
                  id="employeeNumber"
                  value={formData.employeeNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      employeeNumber: e.target.value,
                    }))
                  }
                  placeholder={t("employeeNumberPlaceholder")}
                />
              </Field>

              <Field orientation="vertical">
                <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder={t("emailPlaceholder")}
                />
              </Field>

              {!isEdit ? (
                <Field orientation="vertical">
                  <FieldLabel htmlFor="password">{t("initialPassword")}</FieldLabel>
                  <FieldDescription>
                    {t("initialPasswordDescription")}
                  </FieldDescription>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder={t("passwordPlaceholder")}
                  />
                </Field>
              ) : (
                <Field orientation="vertical">
                  <FieldLabel>{t("password")}</FieldLabel>
                  <FieldDescription>
                    {t("passwordResetDescription")}
                  </FieldDescription>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetPassword}
                    className="w-fit"
                  >
                    {t("resetPassword")}
                  </Button>
                </Field>
              )}

              <Field orientation="vertical">
                <FieldLabel htmlFor="groupId">{t("group")}</FieldLabel>
                <FieldDescription>
                  {t("groupDescription")}
                </FieldDescription>
                <Select
                  value={formData.groupId ?? "none"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      groupId: value === "none" ? undefined : value,
                    }))
                  }
                >
                  <SelectTrigger id="groupId" className="w-full">
                    <SelectValue placeholder={t("selectGroup")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("noGroupOption")}</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field orientation="horizontal">
                <Checkbox
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isAdmin: checked === true,
                    }))
                  }
                />
                <div className="flex flex-col gap-1">
                  <FieldLabel htmlFor="isAdmin">{t("isAdmin")}</FieldLabel>
                  <FieldDescription>
                    {t("isAdminDescription")}
                  </FieldDescription>
                </div>
              </Field>
            </FieldGroup>
          </div>

          <FieldSeparator />

          {/* Employee Settings Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium">{t("workSettings")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("overrideSettingsDescription")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="overrideSettings"
                  checked={overrideSettings}
                  onCheckedChange={setOverrideSettings}
                />
                <label htmlFor="overrideSettings" className="text-sm font-medium cursor-pointer">
                  {t("overrideSettings")}
                </label>
              </div>
            </div>
            
            {overrideSettings ? (
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
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                <p>{t("usingDefaultSettings")}</p>
              </div>
            )}
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

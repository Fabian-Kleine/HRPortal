"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Search, Users, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserGroupDialog } from "@/components/hr-manager/user-group-dialog";
import { DeleteConfirmDialog } from "@/components/hr-manager/delete-confirm-dialog";
import { getHolidayRegionName } from "@/components/hr-manager/holiday-region-selector";
import type { UserGroup, EmployeeSettings } from "@/types/employee";
import { 
  createEmployeeGroup, 
  updateEmployeeGroup, 
  deleteEmployeeGroup,
  type EmployeeGroupWithRelations 
} from "./actions";

interface EmployeeGroupsClientProps {
  initialGroups: EmployeeGroupWithRelations[];
  defaultSettings: EmployeeSettings;
}

export function EmployeeGroupsClient({ 
  initialGroups, 
  defaultSettings 
}: EmployeeGroupsClientProps) {
  const t = useTranslations("HRManager.groups");
  const [isPending, startTransition] = useTransition();
  const [groups, setGroups] = useState(initialGroups);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<EmployeeGroupWithRelations | undefined>(undefined);
  const [groupToDelete, setGroupToDelete] = useState<EmployeeGroupWithRelations | undefined>(undefined);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddGroup = () => {
    setSelectedGroup(undefined);
    setDialogOpen(true);
  };

  const handleEditGroup = (group: EmployeeGroupWithRelations) => {
    setSelectedGroup(group);
    setDialogOpen(true);
  };

  const handleDeleteClick = (group: EmployeeGroupWithRelations) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (groupToDelete) {
      startTransition(async () => {
        try {
          await deleteEmployeeGroup(groupToDelete.id);
          setGroups((prev) => prev.filter((g) => g.id !== groupToDelete.id));
          setGroupToDelete(undefined);
          setDeleteDialogOpen(false);
        } catch (error) {
          console.error("Failed to delete group:", error);
        }
      });
    }
  };

  const handleSaveGroup = (groupData: Omit<UserGroup, "id"> & { id?: string }) => {
    startTransition(async () => {
      try {
        if (groupData.id) {
          // Update existing group
          const updated = await updateEmployeeGroup(groupData.id, {
            name: groupData.name,
            vacationDays: groupData.vacationDays,
            dailyHours: groupData.dailyHours,
            hasFlextime: groupData.hasFlextime,
            holidayRegion: groupData.holidayRegion,
            minBreakTime: groupData.minBreakTime,
            canWorkRemote: groupData.canWorkRemote,
            canSelfApprove: groupData.canSelfApprove,
          });
          setGroups((prev) =>
            prev.map((g) => (g.id === groupData.id ? updated : g))
          );
        } else {
          // Create new group
          const created = await createEmployeeGroup({
            name: groupData.name,
            vacationDays: groupData.vacationDays,
            dailyHours: groupData.dailyHours,
            hasFlextime: groupData.hasFlextime,
            holidayRegion: groupData.holidayRegion,
            minBreakTime: groupData.minBreakTime,
            canWorkRemote: groupData.canWorkRemote,
            canSelfApprove: groupData.canSelfApprove,
          });
          setGroups((prev) => [...prev, created]);
        }
        setDialogOpen(false);
      } catch (error) {
        console.error("Failed to save group:", error);
      }
    });
  };

  // Convert EmployeeGroupWithRelations to UserGroup type for dialog
  const groupToUserGroup = (group?: EmployeeGroupWithRelations): UserGroup | undefined => {
    if (!group) return undefined;
    return {
      id: group.id,
      name: group.name,
      vacationDays: group.settings?.vacationDays ?? defaultSettings.vacationDays,
      dailyHours: group.settings?.dailyHours ?? defaultSettings.dailyHours,
      hasFlextime: group.settings?.hasFlextime ?? defaultSettings.hasFlextime,
      holidayRegion: group.settings?.holidayRegion ?? defaultSettings.holidayRegion,
      minBreakTime: group.settings?.minBreakTime ?? defaultSettings.minBreakTime,
      canWorkRemote: group.settings?.canWorkRemote ?? defaultSettings.canWorkRemote,
      canSelfApprove: group.settings?.canSelfApprove ?? defaultSettings.canSelfApprove,
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>
                {t("description")}
              </CardDescription>
            </div>
            <Button onClick={handleAddGroup} disabled={isPending}>
              <Plus />
              {t("addGroup")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.name")}</TableHead>
                <TableHead>{t("table.members")}</TableHead>
                <TableHead>{t("table.vacationDays")}</TableHead>
                <TableHead>{t("table.dailyHours")}</TableHead>
                <TableHead>{t("table.holidayRegion")}</TableHead>
                <TableHead>{t("table.flextime")}</TableHead>
                <TableHead>{t("table.remote")}</TableHead>
                <TableHead className="text-right">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
                    {t("noGroups")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{group._count?.employees ?? 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>{group.settings?.vacationDays ?? defaultSettings.vacationDays}</TableCell>
                    <TableCell>{group.settings?.dailyHours ?? defaultSettings.dailyHours}h</TableCell>
                    <TableCell className="text-sm">
                      {getHolidayRegionName(group.settings?.holidayRegion ?? defaultSettings.holidayRegion)}
                    </TableCell>
                    <TableCell>
                      {(group.settings?.hasFlextime ?? defaultSettings.hasFlextime) ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      {(group.settings?.canWorkRemote ?? defaultSettings.canWorkRemote) ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEditGroup(group)}
                          disabled={isPending}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">{t("table.actions")}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteClick(group)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">{t("table.actions")}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserGroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={groupToUserGroup(selectedGroup)}
        defaultSettings={defaultSettings}
        onSave={handleSaveGroup}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("deleteDialog.title")}
        description={t("deleteDialog.description", { name: groupToDelete?.name ?? "" })}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

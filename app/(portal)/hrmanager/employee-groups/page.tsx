"use client";

import { useState } from "react";
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

// Mock data - replace with actual API calls
const mockDefaultSettings: EmployeeSettings = {
  vacationDays: 30,
  dailyHours: 8,
  hasFlextime: true,
  holidayRegion: "DE-NW",
  minBreakTime: 30,
  canWorkRemote: true,
  canSelfApprove: false,
};

const initialGroups: UserGroup[] = [
  {
    id: "1",
    name: "Engineering",
    vacationDays: 30,
    dailyHours: 8,
    hasFlextime: true,
    holidayRegion: "DE-NW",
    minBreakTime: 30,
    canWorkRemote: true,
    canSelfApprove: false,
  },
  {
    id: "2",
    name: "Sales",
    vacationDays: 28,
    dailyHours: 8,
    hasFlextime: false,
    holidayRegion: "DE-NW",
    minBreakTime: 45,
    canWorkRemote: false,
    canSelfApprove: false,
  },
  {
    id: "3",
    name: "Human Resources",
    vacationDays: 30,
    dailyHours: 7.5,
    hasFlextime: true,
    holidayRegion: "DE-NW",
    minBreakTime: 30,
    canWorkRemote: true,
    canSelfApprove: true,
  },
];

// Mock member counts - in real app, would be fetched from API
const memberCounts: Record<string, number> = {
  "1": 15,
  "2": 8,
  "3": 4,
};

export default function EmployeeGroupsPage() {
  const t = useTranslations("HRManager.groups");
  const [groups, setGroups] = useState<UserGroup[]>(initialGroups);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | undefined>(undefined);
  const [groupToDelete, setGroupToDelete] = useState<UserGroup | undefined>(undefined);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddGroup = () => {
    setSelectedGroup(undefined);
    setDialogOpen(true);
  };

  const handleEditGroup = (group: UserGroup) => {
    setSelectedGroup(group);
    setDialogOpen(true);
  };

  const handleDeleteClick = (group: UserGroup) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (groupToDelete) {
      setGroups((prev) => prev.filter((g) => g.id !== groupToDelete.id));
      setGroupToDelete(undefined);
      setDeleteDialogOpen(false);
    }
  };

  const handleSaveGroup = (groupData: Omit<UserGroup, "id"> & { id?: string }) => {
    if (groupData.id) {
      // Update existing group
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupData.id ? { ...g, ...groupData } as UserGroup : g
        )
      );
    } else {
      // Create new group
      const newGroup: UserGroup = {
        ...groupData,
        id: crypto.randomUUID(),
      };
      setGroups((prev) => [...prev, newGroup]);
    }
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
            <Button onClick={handleAddGroup}>
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
                        <span>{memberCounts[group.id] ?? 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>{group.vacationDays}</TableCell>
                    <TableCell>{group.dailyHours}h</TableCell>
                    <TableCell className="text-sm">
                      {getHolidayRegionName(group.holidayRegion)}
                    </TableCell>
                    <TableCell>
                      {group.hasFlextime ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      {group.canWorkRemote ? (
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
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">{t("table.actions")}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteClick(group)}
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
        group={selectedGroup}
        defaultSettings={mockDefaultSettings}
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
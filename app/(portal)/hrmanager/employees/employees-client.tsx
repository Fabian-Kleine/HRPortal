"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Search, Shield, ShieldOff } from "lucide-react";
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
import { UserDialog } from "@/components/hr-manager/user-dialog";
import { DeleteConfirmDialog } from "@/components/hr-manager/delete-confirm-dialog";
import type { User, UserGroup, EmployeeSettings } from "@/types/employee";
import { 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  resetEmployeePassword,
  type EmployeeWithRelations 
} from "./actions";

interface EmployeesClientProps {
  initialEmployees: EmployeeWithRelations[];
  groups: UserGroup[];
  defaultSettings: EmployeeSettings;
}

export function EmployeesClient({ 
  initialEmployees, 
  groups, 
  defaultSettings 
}: EmployeesClientProps) {
  const t = useTranslations("HRManager.employees");
  const [isPending, startTransition] = useTransition();
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithRelations | undefined>(undefined);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeWithRelations | undefined>(undefined);

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGroupName = (groupId?: string | null) => {
    if (!groupId) return t("noGroup");
    const group = groups.find((g) => g.id === groupId);
    return group?.name ?? t("noGroup");
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(undefined);
    setDialogOpen(true);
  };

  const handleEditEmployee = (employee: EmployeeWithRelations) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const handleDeleteClick = (employee: EmployeeWithRelations) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (employeeToDelete) {
      startTransition(async () => {
        try {
          await deleteEmployee(employeeToDelete.id);
          setEmployees((prev) => prev.filter((e) => e.id !== employeeToDelete.id));
          setEmployeeToDelete(undefined);
          setDeleteDialogOpen(false);
        } catch (error) {
          console.error("Failed to delete employee:", error);
        }
      });
    }
  };

  const handleSaveEmployee = (
    userData: Omit<User, "id"> & { id?: string; password?: string }
  ) => {
    startTransition(async () => {
      try {
        // Check if we have custom settings
        const hasCustomSettings = 
          userData.vacationDays !== undefined ||
          userData.dailyHours !== undefined ||
          userData.hasFlextime !== undefined ||
          userData.holidayRegion !== undefined ||
          userData.minBreakTime !== undefined ||
          userData.canWorkRemote !== undefined ||
          userData.canSelfApprove !== undefined;

        if (userData.id) {
          // Update existing employee
          const updated = await updateEmployee(userData.id, {
            name: userData.name,
            employeeNumber: userData.employeeNumber,
            email: userData.email,
            isAdmin: userData.isAdmin,
            groupId: userData.groupId,
            useCustomSettings: hasCustomSettings,
            ...(hasCustomSettings && {
              vacationDays: userData.vacationDays,
              dailyHours: userData.dailyHours,
              hasFlextime: userData.hasFlextime,
              holidayRegion: userData.holidayRegion,
              minBreakTime: userData.minBreakTime,
              canWorkRemote: userData.canWorkRemote,
              canSelfApprove: userData.canSelfApprove,
            }),
          });
          setEmployees((prev) =>
            prev.map((e) => (e.id === userData.id ? updated : e))
          );
        } else {
          // Create new employee
          if (!userData.password) {
            throw new Error("Password is required for new employees");
          }
          const created = await createEmployee({
            name: userData.name,
            employeeNumber: userData.employeeNumber,
            email: userData.email,
            password: userData.password,
            isAdmin: userData.isAdmin,
            groupId: userData.groupId,
            ...(hasCustomSettings && {
              vacationDays: userData.vacationDays,
              dailyHours: userData.dailyHours,
              hasFlextime: userData.hasFlextime,
              holidayRegion: userData.holidayRegion,
              minBreakTime: userData.minBreakTime,
              canWorkRemote: userData.canWorkRemote,
              canSelfApprove: userData.canSelfApprove,
            }),
          });
          setEmployees((prev) => [created, ...prev]);
        }
        setDialogOpen(false);
      } catch (error) {
        console.error("Failed to save employee:", error);
      }
    });
  };

  const handleResetPassword = (employeeId: string) => {
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    startTransition(async () => {
      try {
        await resetEmployeePassword(employeeId, tempPassword);
        alert(`${t("passwordResetSuccess")}\n\nTemporary password: ${tempPassword}`);
      } catch (error) {
        console.error("Failed to reset password:", error);
      }
    });
  };

  // Convert EmployeeWithRelations to User type for dialog
  const employeeToUser = (employee?: EmployeeWithRelations): User | undefined => {
    if (!employee) return undefined;
    return {
      id: employee.id,
      name: employee.name,
      employeeNumber: employee.employeeNumber,
      email: employee.email,
      isAdmin: employee.isAdmin,
      groupId: employee.groupId ?? undefined,
      vacationDays: employee.settings?.vacationDays ?? defaultSettings.vacationDays,
      dailyHours: employee.settings?.dailyHours ?? defaultSettings.dailyHours,
      hasFlextime: employee.settings?.hasFlextime ?? defaultSettings.hasFlextime,
      holidayRegion: employee.settings?.holidayRegion ?? defaultSettings.holidayRegion,
      minBreakTime: employee.settings?.minBreakTime ?? defaultSettings.minBreakTime,
      canWorkRemote: employee.settings?.canWorkRemote ?? defaultSettings.canWorkRemote,
      canSelfApprove: employee.settings?.canSelfApprove ?? defaultSettings.canSelfApprove,
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
            <Button onClick={handleAddEmployee} disabled={isPending}>
              <Plus />
              {t("addEmployee")}
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
                <TableHead>{t("table.employeeNumber")}</TableHead>
                <TableHead>{t("table.name")}</TableHead>
                <TableHead>{t("table.email")}</TableHead>
                <TableHead>{t("table.group")}</TableHead>
                <TableHead>{t("table.role")}</TableHead>
                <TableHead className="text-right">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    {t("noEmployees")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-mono">
                      {employee.employeeNumber}
                    </TableCell>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{getGroupName(employee.groupId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {employee.isAdmin ? (
                          <>
                            <Shield className="h-4 w-4 text-primary" />
                            <span>{t("roles.admin")}</span>
                          </>
                        ) : (
                          <>
                            <ShieldOff className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{t("roles.user")}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEditEmployee(employee)}
                          disabled={isPending}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">{t("table.actions")}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteClick(employee)}
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

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={employeeToUser(selectedEmployee)}
        groups={groups}
        defaultSettings={defaultSettings}
        onSave={handleSaveEmployee}
        onResetPassword={handleResetPassword}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("deleteDialog.title")}
        description={t("deleteDialog.description", { name: employeeToDelete?.name ?? "" })}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

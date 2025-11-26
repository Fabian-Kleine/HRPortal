"use client";

import { useState } from "react";
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

const mockGroups: UserGroup[] = [
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
];

const initialUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    employeeNumber: "EMP-001",
    email: "john.doe@company.com",
    isAdmin: true,
    groupId: "1",
    vacationDays: 30,
    dailyHours: 8,
    hasFlextime: true,
    holidayRegion: "DE-NW",
    minBreakTime: 30,
    canWorkRemote: true,
    canSelfApprove: true,
  },
  {
    id: "2",
    name: "Jane Smith",
    employeeNumber: "EMP-002",
    email: "jane.smith@company.com",
    isAdmin: false,
    groupId: "2",
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
    name: "Bob Johnson",
    employeeNumber: "EMP-003",
    email: "bob.johnson@company.com",
    isAdmin: false,
    groupId: undefined,
    vacationDays: 30,
    dailyHours: 8,
    hasFlextime: true,
    holidayRegion: "DE-NW",
    minBreakTime: 30,
    canWorkRemote: true,
    canSelfApprove: false,
  },
];

export default function EmployeesPage() {
  const t = useTranslations("HRManager.employees");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [userToDelete, setUserToDelete] = useState<User | undefined>(undefined);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGroupName = (groupId?: string) => {
    if (!groupId) return t("noGroup");
    const group = mockGroups.find((g) => g.id === groupId);
    return group?.name ?? t("noGroup");
  };

  const handleAddUser = () => {
    setSelectedUser(undefined);
    setDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(undefined);
      setDeleteDialogOpen(false);
    }
  };

  const handleSaveUser = (
    userData: Omit<User, "id"> & { id?: string; password?: string }
  ) => {
    if (userData.id) {
      // Update existing user
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userData.id ? { ...u, ...userData } as User : u
        )
      );
    } else {
      // Create new user
      const newUser: User = {
        ...userData,
        id: crypto.randomUUID(),
      };
      setUsers((prev) => [...prev, newUser]);
    }
  };

  const handleResetPassword = (userId: string) => {
    // In a real app, this would trigger a password reset email or generate a new password
    console.log("Reset password for user:", userId);
    alert(t("passwordResetSuccess"));
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
            <Button onClick={handleAddUser}>
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
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    {t("noEmployees")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono">
                      {user.employeeNumber}
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getGroupName(user.groupId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {user.isAdmin ? (
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
                          onClick={() => handleEditUser(user)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">{t("table.actions")}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteClick(user)}
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
        user={selectedUser}
        groups={mockGroups}
        defaultSettings={mockDefaultSettings}
        onSave={handleSaveUser}
        onResetPassword={handleResetPassword}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("deleteDialog.title")}
        description={t("deleteDialog.description", { name: userToDelete?.name ?? "" })}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
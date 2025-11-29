import Holidays from "date-holidays";
import { EmployeeSettings as PrismaEmployeeSettings } from "@prisma/client";

// Get holiday regions from date-holidays package
export type HolidayRegion = ReturnType<typeof Holidays.prototype.getCountries> extends Record<string, string> ? string : string;

// Pick only the settings fields from Prisma's EmployeeSettings (excluding id, isDefault, timestamps, relations)
export type EmployeeSettingsData = Pick<
  PrismaEmployeeSettings,
  "vacationDays" | "dailyHours" | "hasFlextime" | "holidayRegion" | "minBreakTime" | "canWorkRemote" | "canSelfApprove"
>;

// User-specific fields combined with settings
export interface User extends EmployeeSettingsData {
  id: string;
  name: string;
  employeeNumber: string;
  email: string;
  password?: string; // Only for initial setup
  isAdmin: boolean;
  groupId?: string;
}

// For creating a new user (password is required)
export interface CreateUserData extends Omit<User, "id" | "password"> {
  password: string;
}

// For updating a user (password is optional - only for reset)
export interface UpdateUserData extends Partial<Omit<User, "id" | "password">> {
  resetPassword?: boolean;
  newPassword?: string;
}

// User Group combined with settings
export interface UserGroup extends EmployeeSettingsData {
  id: string;
  name: string;
}

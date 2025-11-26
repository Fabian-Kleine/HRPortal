import Holidays from "date-holidays";

// Get holiday regions from date-holidays package
export type HolidayRegion = ReturnType<typeof Holidays.prototype.getCountries> extends Record<string, string> ? string : string;

// Common settings that apply to users, groups, and general defaults
export interface EmployeeSettings {
  vacationDays: number;
  dailyHours: number;
  hasFlextime: boolean;
  holidayRegion: string;
  minBreakTime: number; // in minutes
  canWorkRemote: boolean;
  canSelfApprove: boolean;
}

// User-specific fields
export interface User extends EmployeeSettings {
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

// User Group
export interface UserGroup extends EmployeeSettings {
  id: string;
  name: string;
}

// Default/general employee settings
export interface DefaultEmployeeSettings extends EmployeeSettings {
  id: "default";
}

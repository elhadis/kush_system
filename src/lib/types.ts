export type Language = "en" | "ar";
export type Direction = "ltr" | "rtl";

export interface Currency {
  id: string;
  code: string;
  name: string;
  exchangeRate: number;
  updatedAt: string;
}

export interface Bank {
  id: string;
  name: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  currency: string;
  currencyId: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  city: string;
  address: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BranchWithRelations extends Branch {
  users: User[];
  bankAccounts: Bank[];
  projects: Project[];
  activities: Activity[];
}

export interface ActivityWithRelations extends Activity {
  branchName?: string;
  bankAccountName?: string;
  bankName?: string;
  currencyCode?: string;
  currencyName?: string;
}

export interface ProjectWithRelations extends Project {
  branchName?: string;
  currencyCode?: string;
  currencyName?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  branchId?: string;
  isActive: boolean;
  avatar?: string;
  /** Hashed password — never returned by public API responses. */
  passwordHash?: string;
  mustChangePasswordOnFirstLogin?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "individual" | "corporate" | "foundation";
  totalDonated: number;
  projectIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  title: string;
  description: string;
  status: "planning" | "active" | "completed" | "on-hold";
  budget: number;
  targetBudget: number;
  spent: number;
  collectedAmount: number;
  donorIds: string[];
  branchId: string;
  currencyId: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  status: "planning" | "active" | "completed" | "scheduled" | "in-progress";
  cost: number;
  branchId: string;
  bankAccountId: string;
  currencyId: string;
  projectId?: string;
  date?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  totalSpent: number;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  value: number;
  status: "active" | "maintenance" | "retired";
  branchId?: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  branchId?: string;
  salary: number;
  hireDate: string;
}

export type Permission =
  | "dashboard.view"
  | "banks.manage"
  | "donors.manage"
  | "projects.manage"
  | "users.manage"
  | "reports.view"
  | "settings.manage";

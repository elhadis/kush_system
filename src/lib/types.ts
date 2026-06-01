export type Language = "en" | "ar";
export type Direction = "ltr" | "rtl";

export interface Bank {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  currency: string;
  branchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
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
  createdAt: string;
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
  description: string;
  status: "planning" | "active" | "completed" | "on-hold";
  budget: number;
  spent: number;
  donorIds: string[];
  branchId?: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: "scheduled" | "in-progress" | "completed";
  date: string;
  createdAt: string;
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

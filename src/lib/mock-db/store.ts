import type {
  Activity,
  Asset,
  Bank,
  Branch,
  Donor,
  Employee,
  Project,
  Role,
  User,
  Vendor,
} from "@/lib/types";
import { generateId } from "@/lib/utils";

const now = () => new Date().toISOString();

const seedBranches: Branch[] = [
  {
    id: "br-1",
    name: "Main Headquarters",
    city: "Khartoum",
    address: "Al Amarat District, Block 12",
    phone: "+249 123 456 789",
    isActive: true,
    createdAt: now(),
  },
  {
    id: "br-2",
    name: "Port Sudan Branch",
    city: "Port Sudan",
    address: "Harbor Road 45",
    phone: "+249 987 654 321",
    isActive: true,
    createdAt: now(),
  },
];

const seedRoles: Role[] = [
  {
    id: "role-1",
    name: "Super Admin",
    permissions: [
      "dashboard.view",
      "banks.manage",
      "donors.manage",
      "projects.manage",
      "users.manage",
      "reports.view",
      "settings.manage",
    ],
    description: "Full system access",
  },
  {
    id: "role-2",
    name: "Finance Manager",
    permissions: ["dashboard.view", "banks.manage", "donors.manage", "reports.view"],
    description: "Financial operations access",
  },
  {
    id: "role-3",
    name: "Project Coordinator",
    permissions: ["dashboard.view", "projects.manage", "donors.manage"],
    description: "Project and donor management",
  },
];

const seedUsers: User[] = [
  {
    id: "user-1",
    name: "Ahmed Hassan",
    email: "ahmed@kush-system.org",
    roleId: "role-1",
    branchId: "br-1",
    isActive: true,
    createdAt: now(),
  },
  {
    id: "user-2",
    name: "Sarah Mohamed",
    email: "sarah@kush-system.org",
    roleId: "role-2",
    branchId: "br-1",
    isActive: true,
    createdAt: now(),
  },
];

const seedBanks: Bank[] = [
  {
    id: "bank-1",
    name: "Bank of Khartoum",
    accountNumber: "****4521",
    balance: 2450000,
    currency: "SDG",
    branchId: "br-1",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "bank-2",
    name: "Faisal Islamic Bank",
    accountNumber: "****7893",
    balance: 1875000,
    currency: "SDG",
    branchId: "br-1",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "bank-3",
    name: "Qatar National Bank",
    accountNumber: "****3344",
    balance: 520000,
    currency: "USD",
    branchId: "br-2",
    createdAt: now(),
    updatedAt: now(),
  },
];

const seedDonors: Donor[] = [
  {
    id: "donor-1",
    name: "Al-Khair Foundation",
    email: "contact@alkhair.org",
    phone: "+971 4 123 4567",
    type: "foundation",
    totalDonated: 850000,
    projectIds: ["proj-1", "proj-2"],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "donor-2",
    name: "Mohamed Ali",
    email: "mali@email.com",
    phone: "+249 912 345 678",
    type: "individual",
    totalDonated: 125000,
    projectIds: ["proj-1"],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "donor-3",
    name: "Global Aid Corp",
    email: "info@globalaid.com",
    phone: "+1 555 0123",
    type: "corporate",
    totalDonated: 420000,
    projectIds: ["proj-2", "proj-3"],
    createdAt: now(),
    updatedAt: now(),
  },
];

const seedProjects: Project[] = [
  {
    id: "proj-1",
    name: "Clean Water Initiative",
    description: "Providing clean water access to rural communities",
    status: "active",
    budget: 500000,
    spent: 320000,
    donorIds: ["donor-1", "donor-2"],
    branchId: "br-1",
    startDate: "2025-01-15",
    endDate: "2026-06-30",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "proj-2",
    name: "Education Support Program",
    description: "School supplies and teacher training",
    status: "active",
    budget: 350000,
    spent: 180000,
    donorIds: ["donor-1", "donor-3"],
    branchId: "br-2",
    startDate: "2025-03-01",
    endDate: "2025-12-31",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "proj-3",
    name: "Medical Relief Campaign",
    description: "Mobile clinics and medicine distribution",
    status: "planning",
    budget: 750000,
    spent: 45000,
    donorIds: ["donor-3"],
    branchId: "br-1",
    startDate: "2025-06-01",
    createdAt: now(),
    updatedAt: now(),
  },
];

const seedActivities: Activity[] = [
  {
    id: "act-1",
    title: "Well Drilling - Phase 2",
    description: "Drilling 5 new wells in Darfur region",
    projectId: "proj-1",
    status: "in-progress",
    date: "2025-05-20",
    createdAt: now(),
  },
  {
    id: "act-2",
    title: "Teacher Workshop",
    description: "Training 50 teachers on modern curriculum",
    projectId: "proj-2",
    status: "scheduled",
    date: "2025-06-15",
    createdAt: now(),
  },
  {
    id: "act-3",
    title: "Medical Supply Procurement",
    description: "Ordering essential medicines and equipment",
    projectId: "proj-3",
    status: "in-progress",
    date: "2025-05-28",
    createdAt: now(),
  },
];

const seedVendors: Vendor[] = [
  {
    id: "ven-1",
    name: "MedSupply Co.",
    category: "Medical",
    email: "orders@medsupply.com",
    phone: "+249 111 222 333",
    totalSpent: 85000,
  },
  {
    id: "ven-2",
    name: "BuildRight Construction",
    category: "Construction",
    email: "info@buildright.sd",
    phone: "+249 444 555 666",
    totalSpent: 210000,
  },
];

const seedAssets: Asset[] = [
  {
    id: "asset-1",
    name: "Toyota Land Cruiser",
    category: "Vehicle",
    value: 45000,
    status: "active",
    branchId: "br-1",
  },
  {
    id: "asset-2",
    name: "Office Building - HQ",
    category: "Property",
    value: 1200000,
    status: "active",
    branchId: "br-1",
  },
];

const seedEmployees: Employee[] = [
  {
    id: "emp-1",
    name: "Fatima Ibrahim",
    position: "HR Director",
    department: "Human Resources",
    branchId: "br-1",
    salary: 8500,
    hireDate: "2022-03-15",
  },
  {
    id: "emp-2",
    name: "Omar Khalil",
    position: "Field Coordinator",
    department: "Operations",
    branchId: "br-2",
    salary: 5200,
    hireDate: "2023-08-01",
  },
];

interface Database {
  banks: Bank[];
  branches: Branch[];
  roles: Role[];
  users: User[];
  donors: Donor[];
  projects: Project[];
  activities: Activity[];
  vendors: Vendor[];
  assets: Asset[];
  employees: Employee[];
}

const globalStore = globalThis as typeof globalThis & {
  __kushDb?: Database;
};

function getStore(): Database {
  if (!globalStore.__kushDb) {
    globalStore.__kushDb = {
      banks: [...seedBanks],
      branches: [...seedBranches],
      roles: [...seedRoles],
      users: [...seedUsers],
      donors: [...seedDonors],
      projects: [...seedProjects],
      activities: [...seedActivities],
      vendors: [...seedVendors],
      assets: [...seedAssets],
      employees: [...seedEmployees],
    };
  }
  return globalStore.__kushDb;
}

export const db = {
  banks: {
    getAll: () => getStore().banks,
    getById: (id: string) => getStore().banks.find((b) => b.id === id),
    create: (data: Omit<Bank, "id" | "createdAt" | "updatedAt">) => {
      const bank: Bank = {
        ...data,
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
      };
      getStore().banks.push(bank);
      return bank;
    },
    update: (id: string, data: Partial<Omit<Bank, "id" | "createdAt">>) => {
      const index = getStore().banks.findIndex((b) => b.id === id);
      if (index === -1) return null;
      getStore().banks[index] = {
        ...getStore().banks[index],
        ...data,
        updatedAt: now(),
      };
      return getStore().banks[index];
    },
    delete: (id: string) => {
      const index = getStore().banks.findIndex((b) => b.id === id);
      if (index === -1) return false;
      getStore().banks.splice(index, 1);
      return true;
    },
  },
  donors: {
    getAll: () => getStore().donors,
    getById: (id: string) => getStore().donors.find((d) => d.id === id),
    create: (data: Omit<Donor, "id" | "createdAt" | "updatedAt">) => {
      const donor: Donor = {
        ...data,
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
      };
      getStore().donors.push(donor);
      return donor;
    },
    update: (id: string, data: Partial<Omit<Donor, "id" | "createdAt">>) => {
      const index = getStore().donors.findIndex((d) => d.id === id);
      if (index === -1) return null;
      getStore().donors[index] = {
        ...getStore().donors[index],
        ...data,
        updatedAt: now(),
      };
      return getStore().donors[index];
    },
    delete: (id: string) => {
      const index = getStore().donors.findIndex((d) => d.id === id);
      if (index === -1) return false;
      getStore().donors.splice(index, 1);
      return true;
    },
  },
  projects: {
    getAll: () => getStore().projects,
    getById: (id: string) => getStore().projects.find((p) => p.id === id),
    create: (data: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
      const project: Project = {
        ...data,
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
      };
      getStore().projects.push(project);
      return project;
    },
    update: (id: string, data: Partial<Omit<Project, "id" | "createdAt">>) => {
      const index = getStore().projects.findIndex((p) => p.id === id);
      if (index === -1) return null;
      getStore().projects[index] = {
        ...getStore().projects[index],
        ...data,
        updatedAt: now(),
      };
      return getStore().projects[index];
    },
    delete: (id: string) => {
      const index = getStore().projects.findIndex((p) => p.id === id);
      if (index === -1) return false;
      getStore().projects.splice(index, 1);
      return true;
    },
  },
  branches: { getAll: () => getStore().branches },
  roles: { getAll: () => getStore().roles },
  users: { getAll: () => getStore().users },
  activities: { getAll: () => getStore().activities },
  vendors: { getAll: () => getStore().vendors },
  assets: { getAll: () => getStore().assets },
  employees: { getAll: () => getStore().employees },
};

export function getDashboardStats() {
  const banks = db.banks.getAll();
  const projects = db.projects.getAll();
  const activities = db.activities.getAll();
  const donors = db.donors.getAll();

  return {
    totalDonations: donors.reduce((sum, d) => sum + d.totalDonated, 0),
    activeProjects: projects.filter((p) => p.status === "active").length,
    liveActivities: activities.filter(
      (a) => a.status === "in-progress" || a.status === "scheduled"
    ).length,
    bankBalances: banks.reduce((sum, b) => sum + b.balance, 0),
    totalProjects: projects.length,
    totalDonors: donors.length,
    recentActivities: activities.slice(0, 5),
    projects,
    banks,
  };
}

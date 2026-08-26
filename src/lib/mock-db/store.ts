import {
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD,
  SUPER_ADMIN_USER_ID,
  hashPassword,
} from "@/lib/auth/password";
import type {
  Activity,
  ActivityWithRelations,
  Asset,
  Bank,
  Branch,
  BranchWithRelations,
  Currency,
  Donor,
  Employee,
  Project,
  ProjectWithRelations,
  Role,
  User,
  Vendor,
} from "@/lib/types";
import { convertToBase } from "@/lib/currency";
import { generateId } from "@/lib/utils";

const now = () => new Date().toISOString();

function normalizeBankFields(
  data: Partial<Bank> & {
    name?: string;
    accountName?: string;
    bankName?: string;
  }
): Pick<Bank, "name" | "accountName" | "bankName"> {
  const bankName = data.bankName ?? data.name ?? "";
  const accountName = data.accountName ?? data.name ?? bankName;
  return {
    bankName,
    accountName,
    name: bankName,
  };
}

function resolveCurrencyFields(currencyId: string): Pick<Bank, "currencyId" | "currency"> {
  const currency = getStore().currencies.find((c) => c.id === currencyId);
  return {
    currencyId,
    currency: currency?.code ?? "SDG",
  };
}

function normalizeProjectFields(
  data: Partial<Project> & {
    name?: string;
    title?: string;
    budget?: number;
    targetBudget?: number;
    spent?: number;
    collectedAmount?: number;
  }
): Pick<
  Project,
  "name" | "title" | "budget" | "targetBudget" | "spent" | "collectedAmount"
> {
  const title = data.title ?? data.name ?? "";
  const targetBudget = data.targetBudget ?? data.budget ?? 0;
  const collectedAmount = data.collectedAmount ?? data.spent ?? 0;
  return {
    title,
    name: title,
    targetBudget,
    budget: targetBudget,
    collectedAmount,
    spent: collectedAmount,
  };
}

const seedCurrencies: Currency[] = [
  {
    id: "cur-sdg",
    code: "SDG",
    name: "Sudanese Pound",
    exchangeRate: 1,
    updatedAt: now(),
  },
  {
    id: "cur-usd",
    code: "USD",
    name: "US Dollar",
    exchangeRate: 600,
    updatedAt: now(),
  },
  {
    id: "cur-eur",
    code: "EUR",
    name: "Euro",
    exchangeRate: 650,
    updatedAt: now(),
  },
];

const seedBranches: Branch[] = [
  {
    id: "br-1",
    name: "Khartoum National Office",
    location: "Khartoum, Sudan",
    city: "Khartoum",
    address: "Al Amarat District, Block 12",
    phone: "+249 123 456 789",
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "br-2",
    name: "Eastern Sudan Office",
    location: "Port Sudan, Sudan",
    city: "Port Sudan",
    address: "Harbor Road 45",
    phone: "+249 987 654 321",
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
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
    id: SUPER_ADMIN_USER_ID,
    name: "Super Admin",
    email: SUPER_ADMIN_EMAIL,
    roleId: "role-1",
    branchId: undefined,
    isActive: true,
    passwordHash: hashPassword(SUPER_ADMIN_PASSWORD),
    mustChangePasswordOnFirstLogin: false,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "user-1",
    name: "Ahmed Hassan",
    email: "ahmed@kush-system.org",
    roleId: "role-1",
    branchId: "br-1",
    isActive: true,
    mustChangePasswordOnFirstLogin: false,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "user-2",
    name: "Sarah Mohamed",
    email: "sarah@kush-system.org",
    roleId: "role-2",
    branchId: "br-1",
    isActive: true,
    mustChangePasswordOnFirstLogin: false,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "user-3",
    name: "Omar Khalil",
    email: "omar@kush-system.org",
    roleId: "role-3",
    branchId: "br-2",
    isActive: true,
    mustChangePasswordOnFirstLogin: false,
    createdAt: now(),
    updatedAt: now(),
  },
];

const seedBanks: Bank[] = [
  {
    id: "bank-1",
    name: "Bank of Khartoum",
    accountName: "Main Operations Account",
    bankName: "Bank of Khartoum",
    accountNumber: "****4521",
    balance: 2450000,
    currency: "SDG",
    currencyId: "cur-sdg",
    branchId: "br-1",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "bank-2",
    name: "Faisal Islamic Bank",
    accountName: "Donations Account",
    bankName: "Faisal Islamic Bank",
    accountNumber: "****7893",
    balance: 1875000,
    currency: "SDG",
    currencyId: "cur-sdg",
    branchId: "br-1",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "bank-3",
    name: "Qatar National Bank",
    accountName: "USD Reserve Account",
    bankName: "Qatar National Bank",
    accountNumber: "****3344",
    balance: 520000,
    currency: "USD",
    currencyId: "cur-usd",
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
    title: "Clean Water Initiative",
    description: "Providing clean water access to rural communities across Sudan",
    status: "active",
    budget: 500000,
    targetBudget: 500000,
    spent: 320000,
    collectedAmount: 320000,
    donorIds: ["donor-1", "donor-2"],
    branchId: "br-1",
    currencyId: "cur-sdg",
    startDate: "2025-01-15",
    endDate: "2026-06-30",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "proj-2",
    name: "Education Support Program",
    title: "Education Support Program",
    description: "School supplies and teacher training nationwide",
    status: "active",
    budget: 350000,
    targetBudget: 350000,
    spent: 180000,
    collectedAmount: 180000,
    donorIds: ["donor-1", "donor-3"],
    branchId: "br-2",
    currencyId: "cur-sdg",
    startDate: "2025-03-01",
    endDate: "2025-12-31",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "proj-3",
    name: "Medical Relief Campaign",
    title: "Medical Relief Campaign",
    description: "Mobile clinics and medicine distribution across Sudan",
    status: "planning",
    budget: 750000,
    targetBudget: 750000,
    spent: 45000,
    collectedAmount: 45000,
    donorIds: ["donor-3"],
    branchId: "br-1",
    currencyId: "cur-usd",
    startDate: "2025-06-01",
    createdAt: now(),
    updatedAt: now(),
  },
];

const seedActivities: Activity[] = [
  {
    id: "act-1",
    title: "Well Drilling - Phase 2",
    description: "Drilling new wells for rural communities across Sudan",
    projectId: "proj-1",
    status: "active",
    cost: 85000,
    branchId: "br-1",
    bankAccountId: "bank-1",
    currencyId: "cur-sdg",
    date: "2025-05-20",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "act-2",
    title: "Teacher Workshop",
    description: "Training teachers on modern curriculum",
    projectId: "proj-2",
    status: "planning",
    cost: 42000,
    branchId: "br-2",
    bankAccountId: "bank-3",
    currencyId: "cur-usd",
    date: "2025-06-15",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "act-3",
    title: "Medical Supply Procurement",
    description: "Ordering essential medicines and equipment",
    projectId: "proj-3",
    status: "active",
    cost: 45000,
    branchId: "br-1",
    bankAccountId: "bank-2",
    currencyId: "cur-sdg",
    date: "2025-05-28",
    createdAt: now(),
    updatedAt: now(),
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
  currencies: Currency[];
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

function migrateStore(store: Database): Database {
  if (!store.currencies?.length) {
    store.currencies = [...seedCurrencies];
  }

  for (const bank of store.banks) {
    if (!bank.currencyId) {
      const match = store.currencies.find((c) => c.code === bank.currency);
      bank.currencyId = match?.id ?? "cur-sdg";
      bank.currency = match?.code ?? "SDG";
    }
  }

  for (const project of store.projects) {
    const normalized = normalizeProjectFields(project);
    Object.assign(project, normalized);
    if (!project.branchId) project.branchId = "br-1";
    if (!project.currencyId) project.currencyId = "cur-sdg";
  }

  for (const activity of store.activities) {
    if (!activity.currencyId) {
      const bank = store.banks.find((b) => b.id === activity.bankAccountId);
      activity.currencyId = bank?.currencyId ?? "cur-sdg";
    }
  }

  for (const branch of store.branches) {
    if (!branch.location) {
      branch.location = branch.city ? `${branch.city}, Sudan` : "Sudan";
    }
    if (!branch.updatedAt) branch.updatedAt = branch.createdAt;
  }

  // Ensure hardcoded Super Admin always exists with the required credentials
  const adminIndex = store.users.findIndex(
    (u) =>
      u.id === SUPER_ADMIN_USER_ID ||
      u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
  );
  const adminUser: User = {
    id: SUPER_ADMIN_USER_ID,
    name: "Super Admin",
    email: SUPER_ADMIN_EMAIL,
    roleId: "role-1",
    branchId: undefined,
    isActive: true,
    passwordHash: hashPassword(SUPER_ADMIN_PASSWORD),
    mustChangePasswordOnFirstLogin: false,
    createdAt: now(),
    updatedAt: now(),
  };
  if (adminIndex === -1) {
    store.users.unshift(adminUser);
  } else {
    store.users[adminIndex] = {
      ...store.users[adminIndex],
      ...adminUser,
      createdAt: store.users[adminIndex].createdAt,
    };
  }

  return store;
}

function getStore(): Database {
  if (!globalStore.__kushDb) {
    globalStore.__kushDb = migrateStore({
      currencies: [...seedCurrencies],
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
    });
  } else {
    globalStore.__kushDb = migrateStore(globalStore.__kushDb);
  }
  return globalStore.__kushDb;
}

export const db = {
  currencies: {
    getAll: () => getStore().currencies ?? [],
    getById: (id: string) =>
      getStore().currencies?.find((c) => c.id === id),
    getByCode: (code: string) =>
      getStore().currencies?.find((c) => c.code === code),
    create: (data: Omit<Currency, "id" | "updatedAt">) => {
      const currency: Currency = {
        ...data,
        id: generateId(),
        updatedAt: now(),
      };
      getStore().currencies.push(currency);
      return currency;
    },
    update: (id: string, data: Partial<Omit<Currency, "id">>) => {
      const index = getStore().currencies.findIndex((c) => c.id === id);
      if (index === -1) return null;
      getStore().currencies[index] = {
        ...getStore().currencies[index],
        ...data,
        updatedAt: now(),
      };
      return getStore().currencies[index];
    },
    delete: (id: string) => {
      const index = getStore().currencies.findIndex((c) => c.id === id);
      if (index === -1) return false;
      getStore().currencies.splice(index, 1);
      return true;
    },
  },
  banks: {
    getAll: () => getStore().banks,
    getById: (id: string) => getStore().banks.find((b) => b.id === id),
    create: (data: Omit<Bank, "id" | "createdAt" | "updatedAt" | "name" | "accountName" | "bankName" | "currency"> & {
      name?: string;
      accountName?: string;
      bankName?: string;
    }) => {
      const normalized = normalizeBankFields(data);
      const currencyFields = resolveCurrencyFields(data.currencyId);
      const bank: Bank = {
        ...data,
        ...normalized,
        ...currencyFields,
        id: generateId(),
        branchId: data.branchId,
        createdAt: now(),
        updatedAt: now(),
      };
      getStore().banks.push(bank);
      return bank;
    },
    update: (id: string, data: Partial<Omit<Bank, "id" | "createdAt">> & {
      name?: string;
      accountName?: string;
      bankName?: string;
    }) => {
      const index = getStore().banks.findIndex((b) => b.id === id);
      if (index === -1) return null;
      const normalized = normalizeBankFields({
        ...getStore().banks[index],
        ...data,
      });
      const currencyFields = data.currencyId
        ? resolveCurrencyFields(data.currencyId)
        : {};
      getStore().banks[index] = {
        ...getStore().banks[index],
        ...data,
        ...normalized,
        ...currencyFields,
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
    create: (
      data: Omit<
        Project,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "name"
        | "title"
        | "budget"
        | "targetBudget"
        | "spent"
        | "collectedAmount"
      > & {
        name?: string;
        title?: string;
        budget?: number;
        targetBudget?: number;
        spent?: number;
        collectedAmount?: number;
      }
    ) => {
      const normalized = normalizeProjectFields(data);
      const project: Project = {
        ...data,
        ...normalized,
        id: generateId(),
        donorIds: data.donorIds ?? [],
        createdAt: now(),
        updatedAt: now(),
      };
      getStore().projects.push(project);
      return project;
    },
    update: (
      id: string,
      data: Partial<Omit<Project, "id" | "createdAt">> & {
        name?: string;
        title?: string;
        budget?: number;
        targetBudget?: number;
        spent?: number;
        collectedAmount?: number;
      }
    ) => {
      const index = getStore().projects.findIndex((p) => p.id === id);
      if (index === -1) return null;
      const normalized = normalizeProjectFields({
        ...getStore().projects[index],
        ...data,
      });
      getStore().projects[index] = {
        ...getStore().projects[index],
        ...data,
        ...normalized,
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
  branches: {
    getAll: () => getStore().branches,
    getById: (id: string) => getStore().branches.find((b) => b.id === id),
    getWithRelations: (id: string): BranchWithRelations | null => {
      const branch = getStore().branches.find((b) => b.id === id);
      if (!branch) return null;
      return {
        ...branch,
        users: getStore().users.filter((u) => u.branchId === id),
        bankAccounts: getStore().banks.filter((b) => b.branchId === id),
        projects: getStore().projects.filter((p) => p.branchId === id),
        activities: getStore().activities.filter((a) => a.branchId === id),
      };
    },
    create: (data: Omit<Branch, "id" | "createdAt" | "updatedAt">) => {
      const branch: Branch = {
        ...data,
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
      };
      getStore().branches.push(branch);
      return branch;
    },
    update: (id: string, data: Partial<Omit<Branch, "id" | "createdAt">>) => {
      const index = getStore().branches.findIndex((b) => b.id === id);
      if (index === -1) return null;
      getStore().branches[index] = {
        ...getStore().branches[index],
        ...data,
        updatedAt: now(),
      };
      return getStore().branches[index];
    },
    delete: (id: string) => {
      const index = getStore().branches.findIndex((b) => b.id === id);
      if (index === -1) return false;
      getStore().branches.splice(index, 1);
      return true;
    },
  },
  roles: { getAll: () => getStore().roles, getById: (id: string) => getStore().roles.find((r) => r.id === id) },
  users: {
    getAll: () => getStore().users,
    getById: (id: string) => getStore().users.find((u) => u.id === id),
    getByEmail: (email: string) =>
      getStore().users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      ),
    create: (data: Omit<User, "id" | "createdAt" | "updatedAt">) => {
      const user: User = {
        ...data,
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
      };
      getStore().users.push(user);
      return user;
    },
    update: (id: string, data: Partial<Omit<User, "id" | "createdAt">>) => {
      const index = getStore().users.findIndex((u) => u.id === id);
      if (index === -1) return null;
      getStore().users[index] = {
        ...getStore().users[index],
        ...data,
        updatedAt: now(),
      };
      return getStore().users[index];
    },
    delete: (id: string) => {
      const index = getStore().users.findIndex((u) => u.id === id);
      if (index === -1) return false;
      getStore().users.splice(index, 1);
      return true;
    },
  },
  activities: {
    getAll: () => getStore().activities,
    getById: (id: string) => getStore().activities.find((a) => a.id === id),
    getByBranch: (branchId: string) =>
      getStore().activities.filter((a) => a.branchId === branchId),
    getByBankAccount: (bankAccountId: string) =>
      getStore().activities.filter((a) => a.bankAccountId === bankAccountId),
    create: (data: Omit<Activity, "id" | "createdAt" | "updatedAt">) => {
      const bank = getStore().banks.find((b) => b.id === data.bankAccountId);
      if (!bank || bank.branchId !== data.branchId) {
        throw new Error("Bank account must belong to the selected branch");
      }
      const activity: Activity = {
        ...data,
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
      };
      getStore().activities.push(activity);
      return activity;
    },
    update: (id: string, data: Partial<Omit<Activity, "id" | "createdAt">>) => {
      const index = getStore().activities.findIndex((a) => a.id === id);
      if (index === -1) return null;
      const merged = { ...getStore().activities[index], ...data };
      if (merged.bankAccountId && merged.branchId) {
        const bank = getStore().banks.find((b) => b.id === merged.bankAccountId);
        if (!bank || bank.branchId !== merged.branchId) {
          throw new Error("Bank account must belong to the selected branch");
        }
      }
      getStore().activities[index] = {
        ...merged,
        updatedAt: now(),
      };
      return getStore().activities[index];
    },
    delete: (id: string) => {
      const index = getStore().activities.findIndex((a) => a.id === id);
      if (index === -1) return false;
      getStore().activities.splice(index, 1);
      return true;
    },
  },
  vendors: { getAll: () => getStore().vendors },
  assets: { getAll: () => getStore().assets },
  employees: { getAll: () => getStore().employees },
};

export function enrichActivity(activity: Activity): ActivityWithRelations {
  const branch = db.branches.getById(activity.branchId);
  const bank = db.banks.getById(activity.bankAccountId);
  const currency = db.currencies.getById(activity.currencyId);
  return {
    ...activity,
    branchName: branch?.name,
    bankAccountName: bank?.accountName,
    bankName: bank?.bankName,
    currencyCode: currency?.code,
    currencyName: currency?.name,
  };
}

export function enrichProject(project: Project): ProjectWithRelations {
  const branch = db.branches.getById(project.branchId);
  const currency = db.currencies.getById(project.currencyId);
  return {
    ...project,
    branchName: branch?.name,
    currencyCode: currency?.code,
    currencyName: currency?.name,
  };
}

export function getDashboardStats(branchId?: string | null) {
  let banks = db.banks.getAll();
  let projects = db.projects.getAll();
  let activities = db.activities.getAll();
  const donors = db.donors.getAll();
  const branches = db.branches.getAll();
  const currencies = db.currencies.getAll();
  const baseCurrency = currencies.find((c) => c.code === "SDG") ?? currencies[0];

  if (branchId) {
    banks = banks.filter((b) => b.branchId === branchId);
    projects = projects.filter((p) => p.branchId === branchId);
    activities = activities.filter((a) => a.branchId === branchId);
  }

  const recentActivities = activities
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)
    .map(enrichActivity);

  const bankBalances = banks.reduce((sum, bank) => {
    const currency = db.currencies.getById(bank.currencyId);
    if (!currency || !baseCurrency) return sum + bank.balance;
    return sum + convertToBase(bank.balance, currency);
  }, 0);

  const activityCostTotal = activities.reduce((sum, activity) => {
    const currency = db.currencies.getById(activity.currencyId);
    if (!currency || !baseCurrency) return sum + activity.cost;
    return sum + convertToBase(activity.cost, currency);
  }, 0);

  const projectBudgetTotal = projects.reduce((sum, project) => {
    const currency = db.currencies.getById(project.currencyId);
    if (!currency || !baseCurrency) return sum + project.targetBudget;
    return sum + convertToBase(project.targetBudget, currency);
  }, 0);

  return {
    totalDonations: donors.reduce((sum, d) => sum + d.totalDonated, 0),
    activeProjects: projects.filter((p) => p.status === "active").length,
    liveActivities: activities.filter(
      (a) =>
        a.status === "active" ||
        a.status === "in-progress" ||
        a.status === "planning" ||
        a.status === "scheduled"
    ).length,
    bankBalances,
    totalProjects: projects.length,
    totalDonors: donors.length,
    recentActivities,
    projects: projects.map(enrichProject),
    banks,
    branches: branches.map((b) => ({ id: b.id, name: b.name })),
    currencies,
    activityCostTotal,
    projectBudgetTotal,
    baseCurrencyCode: baseCurrency?.code ?? "SDG",
  };
}

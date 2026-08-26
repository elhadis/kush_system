"use client";

import type { Role, User } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const SUPER_ADMIN_ROLE_ID = "role-1";
const STORAGE_KEY = "kush-system-user-id";

interface SessionContextValue {
  currentUser: User | null;
  currentRole: Role | null;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  branchFilter: string | null;
  users: User[];
  loading: boolean;
  setCurrentUserId: (userId: string) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const [meRes, usersRes, rolesRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/users"),
        fetch("/api/roles"),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());

      if (meRes.ok) {
        const data = await meRes.json();
        setCurrentUser(data.user ?? null);
        if (data.user?.id) {
          localStorage.setItem(STORAGE_KEY, data.user.id);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const setCurrentUserId = useCallback(
    (userId: string) => {
      const next = users.find((u) => u.id === userId) ?? null;
      setCurrentUser(next);
      if (next) localStorage.setItem(STORAGE_KEY, userId);
    },
    [users]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
    window.location.href = "/login";
  }, []);

  const currentRole = currentUser
    ? (roles.find((r) => r.id === currentUser.roleId) ?? null)
    : null;
  const isSuperAdmin = currentUser?.roleId === SUPER_ADMIN_ROLE_ID;
  const branchFilter =
    isSuperAdmin || !currentUser?.branchId ? null : currentUser.branchId;

  const value = useMemo(
    () => ({
      currentUser,
      currentRole,
      isSuperAdmin,
      isAuthenticated: Boolean(currentUser),
      branchFilter,
      users,
      loading,
      setCurrentUserId,
      logout,
      refreshSession,
    }),
    [
      currentUser,
      currentRole,
      isSuperAdmin,
      branchFilter,
      users,
      loading,
      setCurrentUserId,
      logout,
      refreshSession,
    ]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}

export function useBranchQueryParam(): string {
  const { branchFilter } = useSession();
  return branchFilter ? `?branchId=${branchFilter}` : "";
}

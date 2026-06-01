"use client";

import DataTable, { type Column } from "@/components/ui/DataTable";
import PageHeader, { StatusBadge } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { User } from "@/lib/types";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [roleMap, setRoleMap] = useState<Record<string, string>>({});

  useEffect(() => {
    import("@/lib/mock-db/store").then(({ db }) => {
      setUsers(db.users.getAll());
      const map: Record<string, string> = {};
      db.roles.getAll().forEach((r) => {
        map[r.id] = r.name;
      });
      setRoleMap(map);
    });
  }, []);

  const columns: Column<User>[] = [
    { key: "name", header: t("name") },
    { key: "email", header: t("email") },
    {
      key: "roleId",
      header: t("role"),
      render: (u) => roleMap[u.roleId] ?? u.roleId,
    },
    {
      key: "isActive",
      header: t("status"),
      render: (u) => (
        <StatusBadge
          status={u.isActive ? "success" : "neutral"}
          label={u.isActive ? t("active") : t("inactive")}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("users")} description={t("manageUsers")} />
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <DataTable
          data={users}
          columns={columns}
          searchKeys={["name", "email"]}
          keyExtractor={(u) => u.id}
        />
      </div>
    </div>
  );
}

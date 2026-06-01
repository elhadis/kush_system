"use client";

import DataTable, { type Column } from "@/components/ui/DataTable";
import PageHeader from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { Role } from "@/lib/types";
import { useEffect, useState } from "react";

export default function RolesPage() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    import("@/lib/mock-db/store").then(({ db }) => {
      setRoles(db.roles.getAll());
    });
  }, []);

  const columns: Column<Role>[] = [
    { key: "name", header: t("name") },
    { key: "description", header: t("description") },
    {
      key: "permissions",
      header: t("permissions"),
      render: (role) => (
        <div className="flex flex-wrap gap-1">
          {role.permissions.map((p) => (
            <span
              key={p}
              className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs"
            >
              {p}
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("roles")} description={t("manageRoles")} />
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <DataTable
          data={roles}
          columns={columns}
          searchKeys={["name", "description"]}
          keyExtractor={(r) => r.id}
        />
      </div>
    </div>
  );
}

"use client";

import DataTable, { type Column } from "@/components/ui/DataTable";
import PageHeader, { StatusBadge } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { Branch } from "@/lib/types";
import { useEffect, useState } from "react";

export default function BranchesPage() {
  const { t } = useTranslation();
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    import("@/lib/mock-db/store").then(({ db }) => {
      setBranches(db.branches.getAll());
    });
  }, []);

  const columns: Column<Branch>[] = [
    { key: "name", header: t("name") },
    { key: "city", header: t("city") },
    { key: "address", header: t("address") },
    { key: "phone", header: t("phone") },
    {
      key: "isActive",
      header: t("status"),
      render: (b) => (
        <StatusBadge
          status={b.isActive ? "success" : "neutral"}
          label={b.isActive ? t("active") : t("inactive")}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("branches")} description={t("manageBranches")} />
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <DataTable
          data={branches}
          columns={columns}
          searchKeys={["name", "city", "address"]}
          keyExtractor={(b) => b.id}
        />
      </div>
    </div>
  );
}

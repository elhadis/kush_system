"use client";

import DataTable, { type Column } from "@/components/ui/DataTable";
import PageHeader, { StatusBadge } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { formatCurrency } from "@/lib/utils";
import type { Asset } from "@/lib/types";
import { useEffect, useState } from "react";

export default function AssetsPage() {
  const { t, locale } = useTranslation();
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    import("@/lib/mock-db/store").then(({ db }) => {
      setAssets(db.assets.getAll());
    });
  }, []);

  const statusLabel = (status: Asset["status"]) => {
    const map = {
      active: t("active"),
      maintenance: t("inProgress"),
      retired: t("inactive"),
    };
    return map[status];
  };

  const columns: Column<Asset>[] = [
    { key: "name", header: t("name") },
    { key: "category", header: t("category") },
    {
      key: "value",
      header: t("value"),
      render: (a) => formatCurrency(a.value, locale),
    },
    {
      key: "status",
      header: t("status"),
      render: (a) => (
        <StatusBadge
          status={a.status === "active" ? "success" : "warning"}
          label={statusLabel(a.status)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("assets")} description={t("manageAssets")} />
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <DataTable
          data={assets}
          columns={columns}
          searchKeys={["name", "category"]}
          keyExtractor={(a) => a.id}
        />
      </div>
    </div>
  );
}

"use client";

import DataTable, { type Column } from "@/components/ui/DataTable";
import PageHeader from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { formatCurrency } from "@/lib/utils";
import type { Vendor } from "@/lib/types";
import { useEffect, useState } from "react";

export default function VendorsPage() {
  const { t, locale } = useTranslation();
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    import("@/lib/mock-db/store").then(({ db }) => {
      setVendors(db.vendors.getAll());
    });
  }, []);

  const columns: Column<Vendor>[] = [
    { key: "name", header: t("name") },
    { key: "category", header: t("category") },
    { key: "email", header: t("email") },
    { key: "phone", header: t("phone") },
    {
      key: "totalSpent",
      header: t("spent"),
      render: (v) => formatCurrency(v.totalSpent, locale),
    },
  ];

  return (
    <div>
      <PageHeader title={t("vendors")} description={t("manageVendors")} />
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <DataTable
          data={vendors}
          columns={columns}
          searchKeys={["name", "category", "email"]}
          keyExtractor={(v) => v.id}
        />
      </div>
    </div>
  );
}

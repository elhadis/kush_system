"use client";

import DataTable, { type Column } from "@/components/ui/DataTable";
import PageHeader from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Employee } from "@/lib/types";
import { useEffect, useState } from "react";

export default function HRPage() {
  const { t, locale } = useTranslation();
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    import("@/lib/mock-db/store").then(({ db }) => {
      setEmployees(db.employees.getAll());
    });
  }, []);

  const columns: Column<Employee>[] = [
    { key: "name", header: t("name") },
    { key: "position", header: t("position") },
    { key: "department", header: t("department") },
    {
      key: "salary",
      header: t("salary"),
      render: (e) => formatCurrency(e.salary, locale),
    },
    {
      key: "hireDate",
      header: t("startDate"),
      render: (e) => formatDate(e.hireDate, locale),
    },
  ];

  return (
    <div>
      <PageHeader title={t("hr")} description={t("manageHR")} />
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <DataTable
          data={employees}
          columns={columns}
          searchKeys={["name", "position", "department"]}
          keyExtractor={(e) => e.id}
        />
      </div>
    </div>
  );
}

"use client";

import DataTable, { type Column } from "@/components/ui/DataTable";
import PageHeader, { StatusBadge } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { formatDate } from "@/lib/utils";
import type { Activity } from "@/lib/types";
import { useEffect, useState } from "react";

export default function ActivitiesPage() {
  const { t, locale } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projectMap, setProjectMap] = useState<Record<string, string>>({});

  useEffect(() => {
    import("@/lib/mock-db/store").then(({ db }) => {
      setActivities(db.activities.getAll());
      const map: Record<string, string> = {};
      db.projects.getAll().forEach((p) => {
        map[p.id] = p.name;
      });
      setProjectMap(map);
    });
  }, []);

  const statusLabel = (status: Activity["status"]) => {
    const map = {
      scheduled: t("scheduled"),
      "in-progress": t("inProgress"),
      completed: t("completed"),
    };
    return map[status];
  };

  const statusType = (
    status: Activity["status"]
  ): "success" | "warning" | "info" => {
    if (status === "in-progress") return "success";
    if (status === "scheduled") return "warning";
    return "info";
  };

  const columns: Column<Activity>[] = [
    { key: "title", header: t("title") },
    {
      key: "projectId",
      header: t("projects"),
      render: (a) => projectMap[a.projectId] ?? a.projectId,
    },
    {
      key: "status",
      header: t("status"),
      render: (a) => (
        <StatusBadge status={statusType(a.status)} label={statusLabel(a.status)} />
      ),
    },
    {
      key: "date",
      header: t("date"),
      render: (a) => formatDate(a.date, locale),
    },
  ];

  return (
    <div>
      <PageHeader title={t("activities")} description={t("manageActivities")} />
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <DataTable
          data={activities}
          columns={columns}
          searchKeys={["title", "description"]}
          keyExtractor={(a) => a.id}
        />
      </div>
    </div>
  );
}

"use client";

import { Card, StatCard } from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, Download, FileSpreadsheet, PieChart } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

export default function ReportsPage() {
  const { t, locale } = useTranslation();
  const [stats, setStats] = useState({
    totalDonations: 0,
    bankBalances: 0,
    activeProjects: 0,
    totalDonors: 0,
  });

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) =>
        setStats({
          totalDonations: data.totalDonations,
          bankBalances: data.bankBalances,
          activeProjects: data.activeProjects,
          totalDonors: data.totalDonors,
        })
      );
  }, []);

  const reportTypes = [
    { icon: BarChart3, label: "Financial Summary" },
    { icon: PieChart, label: "Donor Analytics" },
    { icon: FileSpreadsheet, label: "Project Report" },
  ];

  return (
    <div>
      <PageHeader
        title={t("reports")}
        description={t("manageReports")}
        actions={
          <Button variant="secondary">
            <Download className="w-4 h-4" />
            {t("export")}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={t("totalDonations")}
          value={formatCurrency(stats.totalDonations, locale)}
          icon={<BarChart3 className="w-6 h-6 text-white" />}
        />
        <StatCard
          title={t("bankBalances")}
          value={formatCurrency(stats.bankBalances, locale)}
          icon={<PieChart className="w-6 h-6 text-white" />}
        />
        <StatCard
          title={t("activeProjects")}
          value={String(stats.activeProjects)}
          icon={<FileSpreadsheet className="w-6 h-6 text-white" />}
        />
        <StatCard
          title={t("donors")}
          value={String(stats.totalDonors)}
          icon={<BarChart3 className="w-6 h-6 text-white" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportTypes.map(({ icon: Icon, label }) => (
          <Card
            key={label}
            className="cursor-pointer hover:border-primary/40 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center group-hover:scale-105 transition-transform">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{label}</h3>
                <p className="text-xs text-muted mt-0.5">{t("viewAll")}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

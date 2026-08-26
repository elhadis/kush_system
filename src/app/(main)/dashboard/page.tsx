"use client";

import { Card, StatCard } from "@/components/ui/Card";
import PageHeader, { StatusBadge } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { useBranchQueryParam, useSession } from "@/lib/session/SessionProvider";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ActivityWithRelations, Bank, ProjectWithRelations } from "@/lib/types";
import {
  Activity as ActivityIcon,
  ArrowUpRight,
  Banknote,
  FolderKanban,
  Heart,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalDonations: number;
  activeProjects: number;
  liveActivities: number;
  bankBalances: number;
  totalProjects: number;
  totalDonors: number;
  recentActivities: ActivityWithRelations[];
  projects: ProjectWithRelations[];
  banks: Bank[];
  branches: { id: string; name: string }[];
  baseCurrencyCode: string;
  projectBudgetTotal: number;
  activityCostTotal: number;
}

export default function DashboardPage() {
  const { t, locale } = useTranslation();
  const { currentUser, branchFilter, isSuperAdmin } = useSession();
  const branchQuery = useBranchQueryParam();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dashboard${branchQuery}`)
      .then((res) => res.json())
      .then((data: DashboardStats) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [branchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const data = stats ?? {
    totalDonations: 0,
    activeProjects: 0,
    liveActivities: 0,
    bankBalances: 0,
    totalProjects: 0,
    totalDonors: 0,
    recentActivities: [],
    projects: [],
    banks: [],
    branches: [],
    baseCurrencyCode: "SDG",
    projectBudgetTotal: 0,
    activityCostTotal: 0,
  };

  const branchMap = Object.fromEntries(
    (data.branches ?? []).map((b) => [b.id, b.name])
  );

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      active: t("active"),
      planning: t("planning"),
      completed: t("completed"),
      "on-hold": t("onHold"),
      scheduled: t("scheduled"),
      "in-progress": t("inProgress"),
    };
    return map[status] ?? status;
  };

  const statusType = (status: string): "success" | "warning" | "info" | "neutral" => {
    if (status === "active" || status === "in-progress") return "success";
    if (status === "planning" || status === "scheduled") return "warning";
    if (status === "completed") return "info";
    return "neutral";
  };

  return (
    <div>
      <PageHeader
        title={t("dashboard")}
        description={`${t("welcomeBack")}, ${currentUser?.name ?? ""} — ${t("overview")}${!isSuperAdmin && branchFilter ? ` (${t("branchScopedView")})` : ""}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title={t("totalDonations")}
          value={formatCurrency(data.totalDonations, locale)}
          icon={<Heart className="w-6 h-6 text-white" />}
          trend="+12.5% vs last month"
          trendUp
        />
        <StatCard
          title={t("activeProjects")}
          value={String(data.activeProjects)}
          icon={<FolderKanban className="w-6 h-6 text-white" />}
          trend={`${data.totalProjects} total`}
          trendUp
        />
        <StatCard
          title={t("liveActivities")}
          value={String(data.liveActivities)}
          icon={<ActivityIcon className="w-6 h-6 text-white" />}
          trend={t("thisMonth")}
          trendUp
        />
        <StatCard
          title={t("bankBalances")}
          value={formatCurrency(
            data.bankBalances,
            locale,
            data.baseCurrencyCode
          )}
          icon={<Wallet className="w-6 h-6 text-white" />}
          trend={`${data.banks.length} ${t("accounts")} · ${t("convertedToBase")}`}
          trendUp
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Progress */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              {t("projectProgress")}
            </h3>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-4">
            {data.projects.slice(0, 4).map((project) => {
              const progress =
                project.targetBudget > 0
                  ? Math.min(
                      100,
                      (project.collectedAmount / project.targetBudget) * 100
                    )
                  : 0;
              return (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {project.title}
                    </span>
                    <StatusBadge
                      status={statusType(project.status)}
                      label={statusLabel(project.status)}
                    />
                  </div>
                  <div className="h-2 rounded-full bg-background overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-brand transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted">
                    <span>
                      {formatCurrency(
                        project.collectedAmount,
                        locale,
                        project.currencyCode ?? "SDG"
                      )}{" "}
                      /{" "}
                      {formatCurrency(
                        project.targetBudget,
                        locale,
                        project.currencyCode ?? "SDG"
                      )}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              {t("recentActivity")}
            </h3>
            <ActivityIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-4">
            {data.recentActivities.length === 0 ? (
              <p className="text-sm text-muted text-center py-6">
                {t("noResults")}
              </p>
            ) : (
              data.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3 p-3 rounded-xl bg-background/50 hover:bg-surface-hover transition-colors"
                >
                  <div className="w-2 h-2 mt-2 rounded-full gradient-brand shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.title}
                      </p>
                      <StatusBadge
                        status={statusType(activity.status)}
                        label={statusLabel(activity.status)}
                      />
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {activity.branchName} · {activity.bankName} ·{" "}
                      {activity.currencyCode}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted">
                        {formatDate(activity.createdAt, locale)}
                      </p>
                      <p className="text-xs font-semibold text-primary">
                        {formatCurrency(
                          activity.cost,
                          locale,
                          activity.currencyCode ?? "SDG"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Financial Overview */}
      <Card className="mt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            {t("financialOverview")}
          </h3>
          <Banknote className="w-5 h-5 text-primary" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.banks.map((bank) => (
            <div
              key={bank.id}
              className="p-4 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {bank.bankName ?? bank.name}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {bank.accountName} · {bank.accountNumber}
                    {bank.branchId && branchMap[bank.branchId]
                      ? ` · ${branchMap[bank.branchId]}`
                      : ""}
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
              </div>
              <p className="mt-3 text-xl font-bold text-primary">
                {formatCurrency(bank.balance, locale, bank.currency)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

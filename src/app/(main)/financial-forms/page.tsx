"use client";

import { Card } from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { useBranchQueryParam, useSession } from "@/lib/session/SessionProvider";
import { formatCurrency } from "@/lib/utils";
import type { Bank, Branch } from "@/lib/types";
import {
  ArrowLeftRight,
  Building2,
  CreditCard,
  FileText,
  Receipt,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const forms = [
  { icon: Receipt, labelKey: "receiptVoucher" as const },
  { icon: CreditCard, labelKey: "paymentVoucher" as const },
  { icon: ArrowLeftRight, labelKey: "bankTransfer" as const },
  { icon: FileText, labelKey: "invoiceForm" as const },
];

export default function FinancialFormsPage() {
  const { t, locale } = useTranslation();
  const { branchFilter, isSuperAdmin } = useSession();
  const branchQuery = useBranchQueryParam();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/bank-accounts${branchQuery}`),
      fetch("/api/branches"),
    ]).then(async ([banksRes, branchesRes]) => {
      setBanks(await banksRes.json());
      const allBranches = await branchesRes.json();
      setBranches(
        branchFilter
          ? allBranches.filter((b: Branch) => b.id === branchFilter)
          : allBranches
      );
      setLoading(false);
    });
  }, [branchQuery, branchFilter]);

  const banksByBranch = useMemo(() => {
    const grouped: Record<string, Bank[]> = {};
    for (const bank of banks) {
      if (!grouped[bank.branchId]) grouped[bank.branchId] = [];
      grouped[bank.branchId].push(bank);
    }
    return grouped;
  }, [banks]);

  const branchMap = Object.fromEntries(branches.map((b) => [b.id, b.name]));

  return (
    <div>
      <PageHeader
        title={t("financialForms")}
        description={
          branchFilter && !isSuperAdmin
            ? `${t("manageFinancialForms")} — ${t("branchScopedView")}`
            : t("manageFinancialForms")
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {forms.map(({ icon: Icon, labelKey }) => (
          <Card
            key={labelKey}
            className="cursor-pointer hover:border-primary/40 transition-colors group"
          >
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center group-hover:scale-105 transition-transform">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {t(labelKey)}
                </h3>
                <p className="text-xs text-muted mt-1">{t("addNew")}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Wallet className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            {t("bankBalancesByBranch")}
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {branches.map((branch) => {
              const branchBanks = banksByBranch[branch.id] ?? [];
              const totalBalance = branchBanks.reduce(
                (sum, b) => sum + b.balance,
                0
              );

              return (
                <div
                  key={branch.id}
                  className="p-4 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {branch.name}
                      </p>
                      <p className="text-xs text-muted">{branch.location}</p>
                    </div>
                  </div>

                  {branchBanks.length === 0 ? (
                    <p className="text-xs text-muted">{t("noResults")}</p>
                  ) : (
                    <div className="space-y-2">
                      {branchBanks.map((bank) => (
                        <div
                          key={bank.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {bank.bankName}
                            </p>
                            <p className="text-xs text-muted">
                              {bank.accountName} · {bank.accountNumber}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-primary">
                            {formatCurrency(
                              bank.balance,
                              locale,
                              bank.currency
                            )}
                          </p>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="text-xs text-muted">
                          {t("totalBalance")}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {formatCurrency(totalBalance, locale)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

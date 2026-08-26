"use client";

import Button from "@/components/ui/Button";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Modal, {
  FormField,
  ModalActions,
  inputClassName,
  selectClassName,
} from "@/components/ui/Modal";
import PageHeader, { StatusBadge } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { useBranchQueryParam, useSession } from "@/lib/session/SessionProvider";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ActivityWithRelations, Bank, Branch, Currency } from "@/lib/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const emptyForm = {
  title: "",
  description: "",
  status: "planning" as ActivityWithRelations["status"],
  cost: "",
  branchId: "",
  bankAccountId: "",
  currencyId: "",
};

export default function ActivitiesPage() {
  const { t, locale } = useTranslation();
  const { branchFilter, isSuperAdmin } = useSession();
  const branchQuery = useBranchQueryParam();
  const [activities, setActivities] = useState<ActivityWithRelations[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [activitiesRes, branchesRes, banksRes, currenciesRes] =
      await Promise.all([
        fetch(`/api/activities${branchQuery}`),
        fetch("/api/branches"),
        fetch(`/api/bank-accounts${branchQuery}`),
        fetch("/api/currencies"),
      ]);
    setActivities(await activitiesRes.json());
    setBranches(await branchesRes.json());
    setBanks(await banksRes.json());
    setCurrencies(await currenciesRes.json());
    setLoading(false);
  }, [branchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const branchMap = Object.fromEntries(branches.map((b) => [b.id, b.name]));

  const banksForForm = useMemo(() => {
    if (!form.branchId) return banks;
    return banks.filter((b) => b.branchId === form.branchId);
  }, [banks, form.branchId]);

  const statusLabel = (status: ActivityWithRelations["status"]) => {
    const map: Record<string, string> = {
      planning: t("planning"),
      active: t("active"),
      completed: t("completed"),
      scheduled: t("scheduled"),
      "in-progress": t("inProgress"),
    };
    return map[status] ?? status;
  };

  const statusType = (
    status: ActivityWithRelations["status"]
  ): "success" | "warning" | "info" => {
    if (status === "active" || status === "in-progress") return "success";
    if (status === "planning" || status === "scheduled") return "warning";
    return "info";
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      branchId: branchFilter ?? "",
    });
    setModalOpen(true);
  };

  const openEdit = (activity: ActivityWithRelations) => {
    setEditingId(activity.id);
    setForm({
      title: activity.title,
      description: activity.description ?? "",
      status: activity.status,
      cost: String(activity.cost),
      branchId: activity.branchId,
      bankAccountId: activity.bankAccountId,
      currencyId: activity.currencyId,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      status: form.status,
      cost: parseFloat(form.cost) || 0,
      branchId: form.branchId,
      bankAccountId: form.bankAccountId,
      currencyId: form.currencyId,
    };

    if (editingId) {
      await fetch(`/api/activities/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/activities/${id}`, { method: "DELETE" });
    fetchData();
  };

  const columns: Column<ActivityWithRelations>[] = [
    { key: "title", header: t("title") },
    {
      key: "branchId",
      header: t("branch"),
      render: (a) => a.branchName ?? branchMap[a.branchId] ?? a.branchId,
    },
    {
      key: "bankAccountId",
      header: t("bankAccount"),
      render: (a) =>
        a.bankAccountName
          ? `${a.bankName} — ${a.bankAccountName}`
          : a.bankAccountId,
    },
    {
      key: "status",
      header: t("status"),
      render: (a) => (
        <StatusBadge status={statusType(a.status)} label={statusLabel(a.status)} />
      ),
    },
    {
      key: "cost",
      header: t("cost"),
      render: (a) =>
        formatCurrency(a.cost, locale, a.currencyCode ?? "SDG"),
    },
    {
      key: "createdAt",
      header: t("date"),
      render: (a) => formatDate(a.createdAt, locale),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("activities")}
        description={
          branchFilter
            ? `${t("manageActivities")} — ${branchMap[branchFilter] ?? ""}`
            : t("manageActivities")
        }
        actions={
          <Button variant="gradient" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            {t("addActivity")}
          </Button>
        }
      />

      {!isSuperAdmin && branchFilter && (
        <p className="text-sm text-muted mb-4 px-1">
          {t("branchScopedView")}
        </p>
      )}

      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <DataTable
          data={activities}
          columns={columns}
          searchKeys={["title", "description", "branchName", "bankName"]}
          keyExtractor={(a) => a.id}
          actions={(activity) => (
            <>
              <Button variant="ghost" size="sm" onClick={() => openEdit(activity)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(activity.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? t("edit") : t("addActivity")}
        footer={
          <ModalActions
            onCancel={() => setModalOpen(false)}
            onSave={handleSave}
            cancelLabel={t("cancel")}
            saveLabel={t("save")}
            loading={saving}
          />
        }
      >
        <div className="space-y-4">
          <FormField label={t("title")}>
            <input
              className={inputClassName}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </FormField>
          <FormField label={t("description")}>
            <input
              className={inputClassName}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </FormField>
          <FormField label={t("branch")}>
            <select
              className={selectClassName}
              value={form.branchId}
              disabled={!!branchFilter}
              onChange={(e) =>
                setForm({
                  ...form,
                  branchId: e.target.value,
                  bankAccountId: "",
                })
              }
            >
              <option value="">{t("selectBranch")}</option>
              {(branchFilter
                ? branches.filter((b) => b.id === branchFilter)
                : branches
              ).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t("bankAccount")}>
            <select
              className={selectClassName}
              value={form.bankAccountId}
              onChange={(e) => {
                const bank = banks.find((b) => b.id === e.target.value);
                setForm({
                  ...form,
                  bankAccountId: e.target.value,
                  currencyId: bank?.currencyId ?? form.currencyId,
                });
              }}
              disabled={!form.branchId}
            >
              <option value="">{t("selectBankAccount")}</option>
              {banksForForm.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.bankName} — {bank.accountName} ({bank.currency})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t("currency")}>
            <select
              className={selectClassName}
              value={form.currencyId}
              onChange={(e) =>
                setForm({ ...form, currencyId: e.target.value })
              }
            >
              <option value="">{t("selectCurrency")}</option>
              {currencies.map((currency) => (
                <option key={currency.id} value={currency.id}>
                  {currency.code} — {currency.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t("status")}>
            <select
              className={selectClassName}
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as ActivityWithRelations["status"],
                })
              }
            >
              <option value="planning">{t("planning")}</option>
              <option value="active">{t("active")}</option>
              <option value="completed">{t("completed")}</option>
            </select>
          </FormField>
          <FormField label={t("cost")}>
            <input
              type="number"
              className={inputClassName}
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import Button from "@/components/ui/Button";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Modal, {
  FormField,
  ModalActions,
  inputClassName,
  selectClassName,
} from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { useBranchQueryParam, useSession } from "@/lib/session/SessionProvider";
import { formatCurrency } from "@/lib/utils";
import type { Bank, Branch, Currency } from "@/lib/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const emptyForm = {
  accountName: "",
  bankName: "",
  accountNumber: "",
  balance: "",
  currencyId: "",
  branchId: "",
};

export default function BanksPage() {
  const { t, locale } = useTranslation();
  const { branchFilter, isSuperAdmin } = useSession();
  const branchQuery = useBranchQueryParam();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [banksRes, branchesRes, currenciesRes] = await Promise.all([
      fetch(`/api/bank-accounts${branchQuery}`),
      fetch("/api/branches"),
      fetch("/api/currencies"),
    ]);
    setBanks(await banksRes.json());
    const allBranches = await branchesRes.json();
    setBranches(
      branchFilter
        ? allBranches.filter((b: Branch) => b.id === branchFilter)
        : allBranches
    );
    setCurrencies(await currenciesRes.json());
    setLoading(false);
  }, [branchQuery, branchFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const branchMap = Object.fromEntries(branches.map((b) => [b.id, b.name]));

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, branchId: branchFilter ?? "" });
    setModalOpen(true);
  };

  const openEdit = (bank: Bank) => {
    setEditingId(bank.id);
    setForm({
      accountName: bank.accountName,
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      balance: String(bank.balance),
      currencyId: bank.currencyId,
      branchId: bank.branchId,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      accountName: form.accountName,
      bankName: form.bankName,
      accountNumber: form.accountNumber,
      balance: parseFloat(form.balance) || 0,
      currencyId: form.currencyId,
      branchId: form.branchId,
    };

    if (editingId) {
      await fetch(`/api/bank-accounts/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/bank-accounts", {
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
    await fetch(`/api/bank-accounts/${id}`, { method: "DELETE" });
    fetchData();
  };

  const columns: Column<Bank>[] = [
    { key: "bankName", header: t("bankName") },
    { key: "accountName", header: t("accountName") },
    { key: "accountNumber", header: t("accountNumber") },
    {
      key: "balance",
      header: t("balance"),
      render: (bank) => formatCurrency(bank.balance, locale, bank.currency),
    },
    { key: "currency", header: t("currency") },
    {
      key: "branchId",
      header: t("branch"),
      render: (bank) => branchMap[bank.branchId] ?? bank.branchId,
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
        title={t("banks")}
        description={
          branchFilter && !isSuperAdmin
            ? `${t("manageBanks")} — ${t("branchScopedView")}`
            : t("manageBanks")
        }
        actions={
          <Button variant="gradient" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            {t("addBank")}
          </Button>
        }
      />

      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <DataTable
          data={banks}
          columns={columns}
          searchKeys={["bankName", "accountName", "accountNumber", "currency"]}
          keyExtractor={(b) => b.id}
          actions={(bank) => (
            <>
              <Button variant="ghost" size="sm" onClick={() => openEdit(bank)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(bank.id)}
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
        title={editingId ? t("edit") : t("addBank")}
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
          <FormField label={t("bankName")}>
            <input
              className={inputClassName}
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            />
          </FormField>
          <FormField label={t("accountName")}>
            <input
              className={inputClassName}
              value={form.accountName}
              onChange={(e) =>
                setForm({ ...form, accountName: e.target.value })
              }
            />
          </FormField>
          <FormField label={t("accountNumber")}>
            <input
              className={inputClassName}
              value={form.accountNumber}
              onChange={(e) =>
                setForm({ ...form, accountNumber: e.target.value })
              }
            />
          </FormField>
          <FormField label={t("branch")}>
            <select
              className={selectClassName}
              value={form.branchId}
              disabled={!!branchFilter}
              onChange={(e) => setForm({ ...form, branchId: e.target.value })}
            >
              <option value="">{t("selectBranch")}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t("balance")}>
            <input
              type="number"
              className={inputClassName}
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
            />
          </FormField>
          <FormField label={t("currency")}>
            <select
              className={selectClassName}
              value={form.currencyId}
              onChange={(e) => setForm({ ...form, currencyId: e.target.value })}
            >
              <option value="">{t("selectCurrency")}</option>
              {currencies.map((currency) => (
                <option key={currency.id} value={currency.id}>
                  {currency.code} — {currency.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

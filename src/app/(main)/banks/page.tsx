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
import { formatCurrency } from "@/lib/utils";
import type { Bank } from "@/lib/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const emptyForm = {
  name: "",
  accountNumber: "",
  balance: "",
  currency: "USD",
};

export default function BanksPage() {
  const { t, locale } = useTranslation();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchBanks = useCallback(async () => {
    const res = await fetch("/api/banks");
    const data = await res.json();
    setBanks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (bank: Bank) => {
    setEditingId(bank.id);
    setForm({
      name: bank.name,
      accountNumber: bank.accountNumber,
      balance: String(bank.balance),
      currency: bank.currency,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      accountNumber: form.accountNumber,
      balance: parseFloat(form.balance) || 0,
      currency: form.currency,
    };

    if (editingId) {
      await fetch(`/api/banks/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    setModalOpen(false);
    fetchBanks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/banks/${id}`, { method: "DELETE" });
    fetchBanks();
  };

  const columns: Column<Bank>[] = [
    { key: "name", header: t("bankName") },
    { key: "accountNumber", header: t("accountNumber") },
    {
      key: "balance",
      header: t("balance"),
      render: (bank) => formatCurrency(bank.balance, locale, bank.currency),
    },
    { key: "currency", header: t("currency") },
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
        description={t("manageBanks")}
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
          searchKeys={["name", "accountNumber", "currency"]}
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
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option value="USD">USD</option>
              <option value="SDG">SDG</option>
              <option value="EUR">EUR</option>
            </select>
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

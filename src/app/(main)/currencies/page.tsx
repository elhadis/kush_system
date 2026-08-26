"use client";

import Button from "@/components/ui/Button";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Modal, {
  FormField,
  ModalActions,
  inputClassName,
} from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { Currency } from "@/lib/types";
import { Coins, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const emptyForm = {
  code: "",
  name: "",
  exchangeRate: "",
};

export default function CurrenciesPage() {
  const { t } = useTranslation();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCurrencies = useCallback(async () => {
    const res = await fetch("/api/currencies");
    setCurrencies(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (currency: Currency) => {
    setEditingId(currency.id);
    setForm({
      code: currency.code,
      name: currency.name,
      exchangeRate: String(currency.exchangeRate),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      code: form.code.toUpperCase(),
      name: form.name,
      exchangeRate: parseFloat(form.exchangeRate) || 0,
    };

    if (editingId) {
      await fetch(`/api/currencies/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    setModalOpen(false);
    fetchCurrencies();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/currencies/${id}`, { method: "DELETE" });
    fetchCurrencies();
  };

  const columns: Column<Currency>[] = [
    { key: "code", header: t("currencyCode") },
    { key: "name", header: t("currencyName") },
    {
      key: "exchangeRate",
      header: t("exchangeRate"),
      render: (c) => (
        <span>
          {c.exchangeRate}{" "}
          <span className="text-muted text-xs">SDG / {c.code}</span>
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: t("lastUpdated"),
      render: (c) => new Date(c.updatedAt).toLocaleDateString(),
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
        title={t("currencies")}
        description={t("manageCurrencies")}
        actions={
          <Button variant="gradient" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            {t("addCurrency")}
          </Button>
        }
      />

      <div className="glass-card rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-3 mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Coins className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm text-muted">{t("exchangeRateHint")}</p>
        </div>
        <DataTable
          data={currencies}
          columns={columns}
          searchKeys={["code", "name"]}
          keyExtractor={(c) => c.id}
          actions={(currency) => (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEdit(currency)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              {currency.code !== "SDG" && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(currency.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </>
          )}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? t("updateExchangeRate") : t("addCurrency")}
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
          <FormField label={t("currencyCode")}>
            <input
              className={inputClassName}
              value={form.code}
              disabled={!!editingId}
              placeholder="USD"
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
            />
          </FormField>
          <FormField label={t("currencyName")}>
            <input
              className={inputClassName}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FormField>
          <FormField label={t("exchangeRate")}>
            <input
              type="number"
              step="0.01"
              className={inputClassName}
              value={form.exchangeRate}
              onChange={(e) =>
                setForm({ ...form, exchangeRate: e.target.value })
              }
            />
          </FormField>
          <p className="text-xs text-muted">{t("exchangeRateHint")}</p>
        </div>
      </Modal>
    </div>
  );
}

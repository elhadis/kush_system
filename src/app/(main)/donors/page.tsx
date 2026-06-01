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
import { formatCurrency } from "@/lib/utils";
import type { Donor } from "@/lib/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  type: "individual" as Donor["type"],
  totalDonated: "",
};

export default function DonorsPage() {
  const { t, locale } = useTranslation();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchDonors = useCallback(async () => {
    const res = await fetch("/api/donors");
    const data = await res.json();
    setDonors(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  const typeLabel = (type: Donor["type"]) => {
    const map = {
      individual: t("individual"),
      corporate: t("corporate"),
      foundation: t("foundation"),
    };
    return map[type];
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (donor: Donor) => {
    setEditingId(donor.id);
    setForm({
      name: donor.name,
      email: donor.email,
      phone: donor.phone,
      type: donor.type,
      totalDonated: String(donor.totalDonated),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      type: form.type,
      totalDonated: parseFloat(form.totalDonated) || 0,
      projectIds: editingId
        ? donors.find((d) => d.id === editingId)?.projectIds ?? []
        : [],
    };

    if (editingId) {
      await fetch(`/api/donors/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    setModalOpen(false);
    fetchDonors();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/donors/${id}`, { method: "DELETE" });
    fetchDonors();
  };

  const columns: Column<Donor>[] = [
    { key: "name", header: t("donorName") },
    { key: "email", header: t("email") },
    { key: "phone", header: t("phone") },
    {
      key: "type",
      header: t("type"),
      render: (donor) => (
        <StatusBadge status="info" label={typeLabel(donor.type)} />
      ),
    },
    {
      key: "totalDonated",
      header: t("totalDonated"),
      render: (donor) => formatCurrency(donor.totalDonated, locale),
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
        title={t("donors")}
        description={t("manageDonors")}
        actions={
          <Button variant="gradient" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            {t("addDonor")}
          </Button>
        }
      />

      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <DataTable
          data={donors}
          columns={columns}
          searchKeys={["name", "email", "phone", "type"]}
          keyExtractor={(d) => d.id}
          actions={(donor) => (
            <>
              <Button variant="ghost" size="sm" onClick={() => openEdit(donor)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(donor.id)}
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
        title={editingId ? t("edit") : t("addDonor")}
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
          <FormField label={t("donorName")}>
            <input
              className={inputClassName}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FormField>
          <FormField label={t("email")}>
            <input
              type="email"
              className={inputClassName}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>
          <FormField label={t("phone")}>
            <input
              className={inputClassName}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </FormField>
          <FormField label={t("type")}>
            <select
              className={selectClassName}
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as Donor["type"] })
              }
            >
              <option value="individual">{t("individual")}</option>
              <option value="corporate">{t("corporate")}</option>
              <option value="foundation">{t("foundation")}</option>
            </select>
          </FormField>
          <FormField label={t("totalDonated")}>
            <input
              type="number"
              className={inputClassName}
              value={form.totalDonated}
              onChange={(e) =>
                setForm({ ...form, totalDonated: e.target.value })
              }
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

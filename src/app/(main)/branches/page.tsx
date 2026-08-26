"use client";

import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
import type { BranchWithRelations } from "@/lib/types";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  Pencil,
  Plus,
  Trash2,
  UserCircle,
  Wallet,
  Activity as ActivityLucide,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const emptyForm = {
  name: "",
  location: "",
  city: "",
  address: "",
  phone: "",
  isActive: true,
};

export default function BranchesPage() {
  const { t, locale } = useTranslation();
  const [branches, setBranches] = useState<BranchWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchBranches = useCallback(async () => {
    const res = await fetch("/api/branches?include=relations");
    const data = await res.json();
    setBranches(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (branch: BranchWithRelations) => {
    setEditingId(branch.id);
    setForm({
      name: branch.name,
      location: branch.location,
      city: branch.city,
      address: branch.address,
      phone: branch.phone,
      isActive: branch.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form };

    if (editingId) {
      await fetch(`/api/branches/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    setModalOpen(false);
    fetchBranches();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/branches/${id}`, { method: "DELETE" });
    fetchBranches();
  };

  const columns: Column<BranchWithRelations>[] = [
    { key: "name", header: t("name") },
    { key: "location", header: t("location") },
    { key: "phone", header: t("phone") },
    {
      key: "users",
      header: t("usersCount"),
      render: (b) => String(b.users?.length ?? 0),
    },
    {
      key: "bankAccounts",
      header: t("bankAccountsCount"),
      render: (b) => String(b.bankAccounts?.length ?? 0),
    },
    {
      key: "projects",
      header: t("projectsCount"),
      render: (b) => String(b.projects?.length ?? 0),
    },
    {
      key: "activities",
      header: t("activitiesCount"),
      render: (b) => String(b.activities?.length ?? 0),
    },
    {
      key: "isActive",
      header: t("status"),
      render: (b) => (
        <StatusBadge
          status={b.isActive ? "success" : "neutral"}
          label={b.isActive ? t("active") : t("inactive")}
        />
      ),
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
        title={t("branches")}
        description={t("manageBranches")}
        actions={
          <Button variant="gradient" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            {t("addBranch")}
          </Button>
        }
      />

      <div className="glass-card rounded-2xl p-4 sm:p-6 mb-6">
        <DataTable
          data={branches}
          columns={columns}
          searchKeys={["name", "location", "city", "address"]}
          keyExtractor={(b) => b.id}
          actions={(branch) => (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setExpandedId(expandedId === branch.id ? null : branch.id)
                }
              >
                {expandedId === branch.id ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openEdit(branch)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(branch.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        />
      </div>

      {branches.map((branch) =>
        expandedId === branch.id ? (
          <Card key={branch.id} className="mb-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {branch.name} — {t("branchDetails")}
                </h3>
                <p className="text-sm text-muted">{branch.location}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <UserCircle className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">
                    {t("assignedUsers")}
                  </h4>
                </div>
                <div className="space-y-2">
                  {branch.users.length === 0 ? (
                    <p className="text-xs text-muted">{t("noResults")}</p>
                  ) : (
                    branch.users.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 rounded-xl bg-background/50 border border-border"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted">{user.email}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">
                    {t("assignedBankAccounts")}
                  </h4>
                </div>
                <div className="space-y-2">
                  {branch.bankAccounts.length === 0 ? (
                    <p className="text-xs text-muted">{t("noResults")}</p>
                  ) : (
                    branch.bankAccounts.map((bank) => (
                      <div
                        key={bank.id}
                        className="p-3 rounded-xl bg-background/50 border border-border"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {bank.bankName}
                        </p>
                        <p className="text-xs text-muted">{bank.accountName}</p>
                        <p className="text-sm font-bold text-primary mt-1">
                          {formatCurrency(bank.balance, locale, bank.currency)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FolderKanban className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">
                    {t("assignedProjects")}
                  </h4>
                </div>
                <div className="space-y-2">
                  {branch.projects.length === 0 ? (
                    <p className="text-xs text-muted">{t("noResults")}</p>
                  ) : (
                    branch.projects.map((project) => (
                      <div
                        key={project.id}
                        className="p-3 rounded-xl bg-background/50 border border-border"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {project.name}
                        </p>
                        <StatusBadge
                          status={
                            project.status === "active" ? "success" : "warning"
                          }
                          label={project.status}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ActivityLucide className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">
                    {t("assignedActivities")}
                  </h4>
                </div>
                <div className="space-y-2">
                  {branch.activities.length === 0 ? (
                    <p className="text-xs text-muted">{t("noResults")}</p>
                  ) : (
                    branch.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-3 rounded-xl bg-background/50 border border-border"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {formatCurrency(activity.cost, locale)}
                        </p>
                        <StatusBadge
                          status={
                            activity.status === "active" ||
                            activity.status === "in-progress"
                              ? "success"
                              : "warning"
                          }
                          label={activity.status}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Card>
        ) : null
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? t("edit") : t("addBranch")}
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
          <FormField label={t("name")}>
            <input
              className={inputClassName}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FormField>
          <FormField label={t("location")}>
            <input
              className={inputClassName}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </FormField>
          <FormField label={t("city")}>
            <input
              className={inputClassName}
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </FormField>
          <FormField label={t("address")}>
            <input
              className={inputClassName}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </FormField>
          <FormField label={t("phone")}>
            <input
              className={inputClassName}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </FormField>
          <FormField label={t("status")}>
            <select
              className={selectClassName}
              value={form.isActive ? "active" : "inactive"}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.value === "active" })
              }
            >
              <option value="active">{t("active")}</option>
              <option value="inactive">{t("inactive")}</option>
            </select>
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

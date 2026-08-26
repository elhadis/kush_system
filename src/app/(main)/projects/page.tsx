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
import type { Branch, Currency, ProjectWithRelations } from "@/lib/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const emptyForm = {
  title: "",
  description: "",
  status: "planning" as ProjectWithRelations["status"],
  targetBudget: "",
  collectedAmount: "",
  branchId: "",
  currencyId: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
};

export default function ProjectsPage() {
  const { t, locale } = useTranslation();
  const { branchFilter, isSuperAdmin } = useSession();
  const branchQuery = useBranchQueryParam();
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [projectsRes, branchesRes, currenciesRes] = await Promise.all([
      fetch(`/api/projects${branchQuery}`),
      fetch("/api/branches"),
      fetch("/api/currencies"),
    ]);
    setProjects(await projectsRes.json());
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

  const statusLabel = (status: ProjectWithRelations["status"]) => {
    const map = {
      active: t("active"),
      planning: t("planning"),
      completed: t("completed"),
      "on-hold": t("onHold"),
    };
    return map[status];
  };

  const statusType = (
    status: ProjectWithRelations["status"]
  ): "success" | "warning" | "info" | "neutral" => {
    if (status === "active") return "success";
    if (status === "planning") return "warning";
    if (status === "completed") return "info";
    return "neutral";
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, branchId: branchFilter ?? "" });
    setModalOpen(true);
  };

  const openEdit = (project: ProjectWithRelations) => {
    setEditingId(project.id);
    setForm({
      title: project.title,
      description: project.description,
      status: project.status,
      targetBudget: String(project.targetBudget),
      collectedAmount: String(project.collectedAmount),
      branchId: project.branchId,
      currencyId: project.currencyId,
      startDate: project.startDate,
      endDate: project.endDate ?? "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      status: form.status,
      targetBudget: parseFloat(form.targetBudget) || 0,
      collectedAmount: parseFloat(form.collectedAmount) || 0,
      branchId: form.branchId,
      currencyId: form.currencyId,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      donorIds: editingId
        ? projects.find((p) => p.id === editingId)?.donorIds ?? []
        : [],
    };

    if (editingId) {
      await fetch(`/api/projects/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/projects", {
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
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchData();
  };

  const columns: Column<ProjectWithRelations>[] = [
    { key: "title", header: t("projectName") },
    {
      key: "branchId",
      header: t("branch"),
      render: (p) => p.branchName ?? p.branchId,
    },
    {
      key: "status",
      header: t("status"),
      render: (p) => (
        <StatusBadge status={statusType(p.status)} label={statusLabel(p.status)} />
      ),
    },
    {
      key: "targetBudget",
      header: t("targetBudget"),
      render: (p) =>
        formatCurrency(p.targetBudget, locale, p.currencyCode ?? "SDG"),
    },
    {
      key: "collectedAmount",
      header: t("collectedAmount"),
      render: (p) =>
        formatCurrency(p.collectedAmount, locale, p.currencyCode ?? "SDG"),
    },
    {
      key: "startDate",
      header: t("startDate"),
      render: (p) => formatDate(p.startDate, locale),
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
        title={t("projects")}
        description={
          branchFilter && !isSuperAdmin
            ? `${t("manageProjects")} — ${t("branchScopedView")}`
            : t("manageProjects")
        }
        actions={
          <Button variant="gradient" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            {t("addProject")}
          </Button>
        }
      />

      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <DataTable
          data={projects}
          columns={columns}
          searchKeys={["title", "description", "status", "branchName"]}
          keyExtractor={(p) => p.id}
          actions={(project) => (
            <>
              <Button variant="ghost" size="sm" onClick={() => openEdit(project)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(project.id)}
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
        title={editingId ? t("edit") : t("addProject")}
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
          <FormField label={t("projectName")}>
            <input
              className={inputClassName}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </FormField>
          <FormField label={t("description")}>
            <textarea
              className={`${inputClassName} min-h-[80px] resize-y`}
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
          <FormField label={t("status")}>
            <select
              className={selectClassName}
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as ProjectWithRelations["status"],
                })
              }
            >
              <option value="planning">{t("planning")}</option>
              <option value="active">{t("active")}</option>
              <option value="completed">{t("completed")}</option>
              <option value="on-hold">{t("onHold")}</option>
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label={t("targetBudget")}>
              <input
                type="number"
                className={inputClassName}
                value={form.targetBudget}
                onChange={(e) =>
                  setForm({ ...form, targetBudget: e.target.value })
                }
              />
            </FormField>
            <FormField label={t("collectedAmount")}>
              <input
                type="number"
                className={inputClassName}
                value={form.collectedAmount}
                onChange={(e) =>
                  setForm({ ...form, collectedAmount: e.target.value })
                }
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label={t("startDate")}>
              <input
                type="date"
                className={inputClassName}
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </FormField>
            <FormField label={t("endDate")}>
              <input
                type="date"
                className={inputClassName}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </FormField>
          </div>
        </div>
      </Modal>
    </div>
  );
}

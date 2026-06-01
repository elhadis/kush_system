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
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Project } from "@/lib/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const emptyForm = {
  name: "",
  description: "",
  status: "planning" as Project["status"],
  budget: "",
  spent: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
};

export default function ProjectsPage() {
  const { t, locale } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const statusLabel = (status: Project["status"]) => {
    const map = {
      active: t("active"),
      planning: t("planning"),
      completed: t("completed"),
      "on-hold": t("onHold"),
    };
    return map[status];
  };

  const statusType = (
    status: Project["status"]
  ): "success" | "warning" | "info" | "neutral" => {
    if (status === "active") return "success";
    if (status === "planning") return "warning";
    if (status === "completed") return "info";
    return "neutral";
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingId(project.id);
    setForm({
      name: project.name,
      description: project.description,
      status: project.status,
      budget: String(project.budget),
      spent: String(project.spent),
      startDate: project.startDate,
      endDate: project.endDate ?? "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      status: form.status,
      budget: parseFloat(form.budget) || 0,
      spent: parseFloat(form.spent) || 0,
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
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchProjects();
  };

  const columns: Column<Project>[] = [
    { key: "name", header: t("projectName") },
    {
      key: "status",
      header: t("status"),
      render: (p) => (
        <StatusBadge status={statusType(p.status)} label={statusLabel(p.status)} />
      ),
    },
    {
      key: "budget",
      header: t("budget"),
      render: (p) => formatCurrency(p.budget, locale),
    },
    {
      key: "spent",
      header: t("spent"),
      render: (p) => formatCurrency(p.spent, locale),
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
        description={t("manageProjects")}
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
          searchKeys={["name", "description", "status"]}
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
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
          <FormField label={t("status")}>
            <select
              className={selectClassName}
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as Project["status"],
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
            <FormField label={t("budget")}>
              <input
                type="number"
                className={inputClassName}
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
              />
            </FormField>
            <FormField label={t("spent")}>
              <input
                type="number"
                className={inputClassName}
                value={form.spent}
                onChange={(e) => setForm({ ...form, spent: e.target.value })}
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

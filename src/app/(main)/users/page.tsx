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
import Toast, { type ToastState } from "@/components/ui/Toast";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { Branch, Role, User } from "@/lib/types";
import { Dices, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const emptyForm = {
  name: "",
  email: "",
  roleId: "",
  branchId: "",
  isActive: true,
  password: "",
};

function generateClientPassword(length = 12): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => chars[v % chars.length]).join("");
}

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const fetchData = useCallback(async () => {
    const [usersRes, branchesRes, rolesRes] = await Promise.all([
      fetch("/api/users"),
      fetch("/api/branches"),
      fetch("/api/roles"),
    ]);
    setUsers(await usersRes.json());
    setBranches(await branchesRes.json());
    setRoles(await rolesRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const branchMap = Object.fromEntries(branches.map((b) => [b.id, b.name]));
  const roleMap = Object.fromEntries(roles.map((r) => [r.id, r.name]));

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      branchId: user.branchId ?? "",
      isActive: user.isActive,
      password: "",
    });
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleGeneratePassword = () => {
    const password = generateClientPassword();
    setForm((prev) => ({ ...prev, password }));
    setShowPassword(true);
  };

  const handleSave = async () => {
    if (!editingId && !form.password.trim()) {
      setToast({ tone: "error", message: t("passwordRequired") });
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const payload = {
          name: form.name,
          email: form.email,
          roleId: form.roleId,
          branchId: form.branchId || undefined,
          isActive: form.isActive,
        };
        const res = await fetch(`/api/users/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? t("error"));
        }
        setToast({ tone: "success", message: t("userUpdatedSuccess") });
      } else {
        const payload = {
          name: form.name,
          email: form.email,
          roleId: form.roleId,
          branchId: form.branchId || undefined,
          isActive: form.isActive,
          password: form.password,
          mustChangePasswordOnFirstLogin: true,
        };
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.email?.sent === false) {
          throw new Error(
            data.error ?? data.email?.message ?? t("userCreateError")
          );
        }

        const previewUrl = data.email?.previewUrl as string | undefined;
        const emailMode = data.email?.mode as string | undefined;

        // Ethereal never delivers to Gmail — open the preview so the email is visible
        if (previewUrl) {
          window.open(previewUrl, "_blank", "noopener,noreferrer");
        }

        setToast({
          tone: "success",
          message:
            emailMode === "ethereal"
              ? t("userCreatedEmailPreview")
              : t("userCreatedSuccess"),
          actionUrl: previewUrl,
          actionLabel: previewUrl ? t("openWelcomeEmail") : undefined,
        });
      }

      setModalOpen(false);
      fetchData();
    } catch (error) {
      setToast({
        tone: "error",
        message:
          error instanceof Error ? error.message : t("userCreateError"),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    fetchData();
  };

  const columns: Column<User>[] = [
    { key: "name", header: t("name") },
    { key: "email", header: t("email") },
    {
      key: "roleId",
      header: t("role"),
      render: (u) => roleMap[u.roleId] ?? u.roleId,
    },
    {
      key: "branchId",
      header: t("branch"),
      render: (u) =>
        u.branchId ? (branchMap[u.branchId] ?? u.branchId) : t("noBranch"),
    },
    {
      key: "isActive",
      header: t("status"),
      render: (u) => (
        <StatusBadge
          status={u.isActive ? "success" : "neutral"}
          label={u.isActive ? t("active") : t("inactive")}
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
      <Toast toast={toast} onClose={() => setToast(null)} />

      <PageHeader
        title={t("users")}
        description={t("manageUsers")}
        actions={
          <Button variant="gradient" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            {t("addUser")}
          </Button>
        }
      />

      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <DataTable
          data={users}
          columns={columns}
          searchKeys={["name", "email"]}
          keyExtractor={(u) => u.id}
          actions={(user) => (
            <>
              <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(user.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editingId ? t("edit") : t("addUser")}
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
          <FormField label={t("email")}>
            <input
              type="email"
              className={inputClassName}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>

          {!editingId && (
            <FormField label={t("password")}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`${inputClassName} pe-10`}
                    value={form.password}
                    autoComplete="new-password"
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGeneratePassword}
                >
                  <Dices className="w-4 h-4" />
                  {t("generatePassword")}
                </Button>
              </div>
              <p className="text-xs text-muted mt-1.5">{t("passwordHint")}</p>
            </FormField>
          )}

          <FormField label={t("role")}>
            <select
              className={selectClassName}
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
            >
              <option value="">{t("selectRole")}</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t("branch")}>
            <select
              className={selectClassName}
              value={form.branchId}
              onChange={(e) => setForm({ ...form, branchId: e.target.value })}
            >
              <option value="">{t("noBranch")}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
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

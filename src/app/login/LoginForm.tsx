"use client";

import Button from "@/components/ui/Button";
import Toast, { type ToastState } from "@/components/ui/Toast";
import { inputClassName } from "@/components/ui/Modal";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = t("emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = t("emailInvalid");
    }
    if (!password) errors.password = t("passwordRequiredLogin");
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? t("loginFailed"));
      }

      setToast({ tone: "success", message: t("loginSuccess") });
      router.replace(nextPath.startsWith("/") ? nextPath : "/dashboard");
      router.refresh();
    } catch (error) {
      setToast({
        tone: "error",
        message:
          error instanceof Error ? error.message : t("loginFailed"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(127,29,29,0.2), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(226,232,240,1) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-brand shadow-lg shadow-primary/30 mb-4">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-brand-text tracking-tight">
            {t("appName")}
          </h1>
          <p className="text-sm text-muted mt-2">{t("loginSubtitle")}</p>
        </div>

        <div className="glass-card rounded-2xl border border-border p-6 sm:p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-foreground mb-1">
            {t("signIn")}
          </h2>
          <p className="text-sm text-muted mb-6">{t("signInHint")}</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-muted"
              >
                {t("email")}
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className={`${inputClassName} ps-10 ${
                    fieldErrors.email
                      ? "border-red-500/60 focus:ring-red-500/40"
                      : ""
                  }`}
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((f) => ({ ...f, email: undefined }));
                    }
                  }}
                  disabled={loading}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-muted"
              >
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`${inputClassName} ps-10 pe-10 ${
                    fieldErrors.password
                      ? "border-red-500/60 focus:ring-red-500/40"
                      : ""
                  }`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((f) => ({ ...f, password: undefined }));
                    }
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute end-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {loading ? t("signingIn") : t("signIn")}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted/70 mt-6">
          NAS ERP © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

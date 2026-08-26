"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, ExternalLink, X, XCircle } from "lucide-react";
import { useEffect } from "react";

export type ToastTone = "success" | "error";

export interface ToastState {
  message: string;
  tone: ToastTone;
  actionUrl?: string;
  actionLabel?: string;
}

interface ToastProps {
  toast: ToastState | null;
  onClose: () => void;
  durationMs?: number;
}

export default function Toast({
  toast,
  onClose,
  durationMs = 4000,
}: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const ms = toast.actionUrl ? Math.max(durationMs, 12000) : durationMs;
    const timer = window.setTimeout(onClose, ms);
    return () => window.clearTimeout(timer);
  }, [toast, onClose, durationMs]);

  if (!toast) return null;

  const isSuccess = toast.tone === "success";

  return (
    <div
      className="fixed top-4 end-4 z-[60] max-w-md w-[calc(100%-2rem)] animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border p-4 shadow-2xl bg-surface",
          isSuccess
            ? "border-primary/40 shadow-primary/10"
            : "border-red-500/40 shadow-red-500/10"
        )}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-sm text-foreground leading-relaxed">
            {toast.message}
          </p>
          {toast.actionUrl && (
            <a
              href={toast.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              {toast.actionLabel ?? "Open email"}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

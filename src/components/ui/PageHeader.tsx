"use client";

import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">{actions}</div>
      )}
    </div>
  );
}

export function StatusBadge({
  status,
  label,
}: {
  status: "success" | "warning" | "info" | "danger" | "neutral";
  label: string;
}) {
  const colors = {
    success: "bg-primary/20 text-primary border-primary/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    danger: "bg-red-500/20 text-red-400 border-red-500/30",
    neutral: "bg-muted/20 text-muted border-border",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status]}`}
    >
      {label}
    </span>
  );
}

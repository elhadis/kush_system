"use client";

import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { type ReactNode, useState } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
  mobileLabel?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  keyExtractor: (item: T) => string;
  actions?: (item: T) => ReactNode;
  emptyMessage?: string;
}

export default function DataTable<T extends object>({
  data,
  columns,
  searchKeys = [],
  searchPlaceholder,
  keyExtractor,
  actions,
  emptyMessage,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const placeholder = searchPlaceholder ?? t("search");
  const empty = emptyMessage ?? t("noResults");

  const filtered = data.filter((item) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return searchKeys.some((key) => {
      const val = item[key];
      return String(val ?? "").toLowerCase().includes(query);
    });
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-start font-semibold text-muted uppercase tracking-wider text-xs",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-end font-semibold text-muted uppercase tracking-wider text-xs">
                  {t("actions")}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center text-muted"
                >
                  {empty}
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="bg-background/50 hover:bg-surface-hover transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3 text-foreground", col.className)}
                    >
                      {col.render
                        ? col.render(item)
                        : String(item[col.key as keyof T] ?? "")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-end">{actions(item)}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-muted">
            {empty}
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={keyExtractor(item)}
              className="glass-card rounded-2xl p-4 space-y-3"
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex justify-between items-start gap-3"
                >
                  <span className="text-xs text-muted uppercase tracking-wide shrink-0">
                    {col.mobileLabel ?? col.header}
                  </span>
                  <span className="text-sm text-foreground text-end">
                    {col.render
                      ? col.render(item)
                      : String(item[col.key as keyof T] ?? "")}
                  </span>
                </div>
              ))}
              {actions && (
                <div className="pt-2 border-t border-border flex justify-end gap-2">
                  {actions(item)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-muted">
        {t("totalRecords")}: {filtered.length}
      </p>
    </div>
  );
}

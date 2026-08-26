"use client";

import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import {
  Activity,
  Banknote,
  Building2,
  ChevronLeft,
  ChevronRight,
  Coins,
  FileText,
  FolderKanban,
  Heart,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  Truck,
  UserCircle,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { type TranslationKey } from "@/lib/i18n/translations";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ElementType } from "react";

interface NavItem {
  href: string;
  labelKey: TranslationKey;
  icon: ElementType;
}

const navItems: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/banks", labelKey: "banks", icon: Wallet },
  { href: "/currencies", labelKey: "currencies", icon: Coins },
  { href: "/branches", labelKey: "branches", icon: Building2 },
  { href: "/roles", labelKey: "roles", icon: Shield },
  { href: "/users", labelKey: "users", icon: Users },
  { href: "/donors", labelKey: "donors", icon: Heart },
  { href: "/projects", labelKey: "projects", icon: FolderKanban },
  { href: "/activities", labelKey: "activities", icon: Activity },
  { href: "/financial-forms", labelKey: "financialForms", icon: Banknote },
  { href: "/assets", labelKey: "assets", icon: Package },
  { href: "/vendors", labelKey: "vendors", icon: Truck },
  { href: "/hr", labelKey: "hr", icon: UserCircle },
  { href: "/reports", labelKey: "reports", icon: FileText },
  { href: "/settings", labelKey: "settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t, direction } = useTranslation();
  const ChevronIcon = direction === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "h-full w-72 bg-surface border-e border-border shrink-0",
          "flex flex-col transition-transform duration-300 ease-in-out",
          "fixed top-0 z-50 lg:static lg:z-auto lg:translate-x-0",
          direction === "rtl"
            ? isOpen
              ? "translate-x-0 end-0"
              : "translate-x-full end-0 lg:translate-x-0"
            : isOpen
              ? "translate-x-0 start-0"
              : "-translate-x-full start-0 lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg leading-tight">
                {t("appName")}
              </h1>
              <p className="text-[10px] text-muted uppercase tracking-widest">
                {t("appSubtitle")}
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover"
            aria-label={t("close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "gradient-brand text-white shadow-lg shadow-primary/20"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-muted group-hover:text-primary"
                  )}
                />
                <span className="truncate">{t(item.labelKey)}</span>
                {isActive && (
                  <ChevronIcon className="w-4 h-4 ms-auto opacity-70" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="rounded-xl bg-background/50 p-3 text-center">
            <p className="text-xs text-muted">v1.0.0</p>
            <p className="text-[10px] text-muted/60 mt-0.5">NAS ERP © 2025</p>
          </div>
        </div>
      </aside>
    </>
  );
}

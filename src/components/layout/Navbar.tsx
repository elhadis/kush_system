"use client";

import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { useSession } from "@/lib/session/SessionProvider";
import { cn } from "@/lib/utils";
import { Bell, ChevronDown, LogOut, Menu, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { t } = useTranslation();
  const {
    currentUser,
    currentRole,
    users,
    setCurrentUserId,
    branchFilter,
    isSuperAdmin,
    logout,
  } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications] = useState(3);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 glass-card border-b border-border rounded-none">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            aria-label={t("menu")}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold gradient-brand-text truncate">
              {t("appName")}
            </h2>
            {!isSuperAdmin && branchFilter && (
              <p className="text-[10px] text-muted truncate">
                {t("branchScopedView")}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher />

          <button
            className="relative p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            aria-label={t("notifications")}
          >
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute top-1 end-1 w-4 h-4 rounded-full gradient-brand text-[10px] font-bold text-white flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 pe-3 rounded-xl hover:bg-surface-hover transition-colors"
            >
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-foreground">
                {currentUser?.name ?? "..."}
              </span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted transition-transform hidden sm:block",
                  profileOpen && "rotate-180"
                )}
              />
            </button>

            {profileOpen && (
              <div className="absolute end-0 mt-2 w-56 rounded-xl bg-surface border border-border shadow-2xl py-1 animate-fade-in z-50">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground">
                    {currentUser?.name}
                  </p>
                  <p className="text-xs text-muted">{currentRole?.name}</p>
                </div>
                <p className="px-4 py-2 text-[10px] uppercase tracking-wider text-muted">
                  {t("switchUser")}
                </p>
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setCurrentUserId(user.id);
                      setProfileOpen(false);
                      window.location.reload();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors text-start",
                      currentUser?.id === user.id
                        ? "text-primary font-medium"
                        : "text-foreground"
                    )}
                  >
                    <User className="w-4 h-4 text-muted shrink-0" />
                    <span className="truncate">{user.name}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    void logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-surface-hover transition-colors border-t border-border mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  {t("logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

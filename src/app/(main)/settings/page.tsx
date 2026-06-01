"use client";

import { Card } from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { Bell, Globe, Moon, Shield, User } from "lucide-react";

export default function SettingsPage() {
  const { t } = useTranslation();

  const sections = [
    {
      icon: User,
      title: t("profile"),
      description: "Manage your account settings and preferences",
    },
    {
      icon: Globe,
      title: t("language"),
      description: "Switch between Arabic and English",
      action: <LanguageSwitcher />,
    },
    {
      icon: Bell,
      title: t("notifications"),
      description: "Configure notification preferences",
    },
    {
      icon: Shield,
      title: t("roles"),
      description: "View role-based access control settings",
    },
    {
      icon: Moon,
      title: "Theme",
      description: "Premium Luxury Tech Dark Mode (Active)",
    },
  ];

  return (
    <div>
      <PageHeader title={t("settings")} description={t("manageSettings")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(({ icon: Icon, title, description, action }) => (
          <Card key={title} className="hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted mt-1">{description}</p>
                {action && <div className="mt-4">{action}</div>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

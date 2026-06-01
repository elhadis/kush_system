"use client";

import { Card } from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { FileText, Receipt, CreditCard, ArrowLeftRight } from "lucide-react";

const forms = [
  { icon: Receipt, key: "receipt" as const },
  { icon: CreditCard, key: "payment" as const },
  { icon: ArrowLeftRight, key: "transfer" as const },
  { icon: FileText, key: "invoice" as const },
];

export default function FinancialFormsPage() {
  const { t } = useTranslation();

  const labels: Record<string, string> = {
    receipt: "Receipt Voucher",
    payment: "Payment Voucher",
    transfer: "Bank Transfer",
    invoice: "Invoice Form",
  };

  return (
    <div>
      <PageHeader
        title={t("financialForms")}
        description={t("manageFinancialForms")}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {forms.map(({ icon: Icon, key }) => (
          <Card
            key={key}
            className="cursor-pointer hover:border-primary/40 transition-colors group"
          >
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center group-hover:scale-105 transition-transform">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{labels[key]}</h3>
                <p className="text-xs text-muted mt-1">{t("addNew")}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

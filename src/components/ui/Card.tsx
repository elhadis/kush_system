import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className, glow }: CardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-5 sm:p-6 animate-fade-in",
        glow && "stat-glow",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden group", className)} glow>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute -top-12 -end-12 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />
      </div>
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted truncate">{title}</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-foreground truncate">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                "mt-2 text-xs font-medium",
                trendUp ? "text-primary" : "text-red-400"
              )}
            >
              {trend}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 w-12 h-12 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-primary/20">
          {icon}
        </div>
      </div>
    </Card>
  );
}

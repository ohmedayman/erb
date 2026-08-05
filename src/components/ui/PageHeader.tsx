import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

function PageHeader({ title, description, icon, action, secondaryAction, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {secondaryAction}
        {action}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  color?: "orange" | "blue" | "green" | "purple" | "pink" | "cyan" | "red";
  className?: string;
}

const colorMap = {
  orange: { bg: "bg-primary/10", text: "text-primary" },
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  green: { bg: "bg-emerald-50", text: "text-emerald-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-600" },
  pink: { bg: "bg-pink-50", text: "text-pink-600" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-600" },
  red: { bg: "bg-red-50", text: "text-red-600" },
};

function StatCard({ title, value, change, icon, color = "orange", className }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className={cn("bg-card rounded-2xl border border-border/60 p-5 hover-lift", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  "text-xs font-semibold px-1.5 py-0.5 rounded-md",
                  change >= 0
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                )}
              >
                {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
              </span>
              <span className="text-[10px] text-muted-foreground">هذا الشهر</span>
            </div>
          )}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", colors.bg, colors.text)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export { PageHeader, EmptyState, StatCard };

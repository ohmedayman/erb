import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info" | "outline";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary-light text-primary border-primary/20",
  success: "bg-success-light text-emerald-600 border-emerald-200",
  warning: "bg-warning-light text-amber-600 border-amber-200",
  danger: "bg-danger-light text-red-600 border-red-200",
  info: "bg-info-light text-blue-600 border-blue-200",
  outline: "bg-transparent text-foreground border-border",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-xs",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-muted-foreground",
  primary: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  outline: "bg-foreground",
};

function Badge({ variant = "default", size = "md", dot = false, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold border rounded-full whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />
      )}
      {children}
    </span>
  );
}

type StatusType = "active" | "pending" | "processing" | "shipped" | "delivered" | "paid" | "unpaid" | "overdue" | "cancelled" | "returned" | "synced" | "draft";

const statusConfig: Record<StatusType, { label: string; variant: BadgeVariant }> = {
  active: { label: "نشط", variant: "success" },
  pending: { label: "قيد الانتظار", variant: "warning" },
  processing: { label: "قيد المعالجة", variant: "info" },
  shipped: { label: "تم الشحن", variant: "info" },
  delivered: { label: "تم التوصيل", variant: "success" },
  paid: { label: "مدفوع", variant: "success" },
  unpaid: { label: "غير مدفوع", variant: "danger" },
  overdue: { label: "متأخر", variant: "danger" },
  cancelled: { label: "ملغي", variant: "danger" },
  returned: { label: "مرتجع", variant: "warning" },
  synced: { label: "متزامن", variant: "success" },
  draft: { label: "مسودة", variant: "default" },
};

function StatusBadge({ status, className }: { status: StatusType; className?: string }) {
  const config = statusConfig[status] || { label: status, variant: "default" as BadgeVariant };
  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  );
}

export { Badge, StatusBadge, type BadgeProps, type StatusType };

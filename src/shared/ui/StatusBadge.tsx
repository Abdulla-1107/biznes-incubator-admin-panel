import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  variant: "info" | "warning" | "success" | "destructive" | "muted";
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<string, string> = {
  info: "bg-info/15 text-info border-info/20",
  warning: "bg-warning/15 text-warning border-warning/20",
  success: "bg-success/15 text-success border-success/20",
  destructive: "bg-destructive/15 text-destructive border-destructive/20",
  muted: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface SortableHeadProps {
  children: React.ReactNode;
  field: string;
  sortBy: string | null;
  sortOrder: "asc" | "desc" | null;
  onSort: (field: string) => void;
  className?: string;
}

export function SortableHead({ children, field, sortBy, sortOrder, onSort, className }: SortableHeadProps) {
  const active = sortBy === field;
  return (
    <TableHead
      className={cn("cursor-pointer select-none hover:text-foreground transition-colors", className)}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {active && sortOrder === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : active && sortOrder === "desc" ? (
          <ArrowDown className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
        )}
      </span>
    </TableHead>
  );
}

import { useState } from "react";
import { FileText, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { SortableHead } from "@/shared/ui/SortableHead";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { EmptyState, TableSkeleton } from "@/shared/ui/DataStates";
import { useGetList, useDelete, useBulkDelete, usePatchStatus } from "@/shared/api/query-hooks";
import { useTableState } from "@/shared/hooks/useTableState";
import {
  Application,
  ApplicationStatus,
  applicationStatusLabels,
  applicationStatusColors,
} from "@/shared/types";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

const ApplicationsPage = () => {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<Application | null>(null);

  const { data: rawItems = [], isLoading } = useGetList<Application>("applications", "/applications");
  const deleteMutation = useDelete("applications", "/applications");
  const bulkDeleteMutation = useBulkDelete("applications", "/applications");
  const statusMutation = usePatchStatus("applications", "/applications");

  const table = useTableState<Application>({
    items: rawItems,
    searchFields: ["fullName", "email", "phone"],
    filterField: "status",
    filterValue: statusFilter,
  });

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    statusMutation.mutate({ id, status }, { onSuccess: () => toast.success("Holat yangilandi") });
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate([...table.selectedIds], {
      onSuccess: () => { toast.success(`${table.selectedIds.size} ta ariza o'chirildi`); table.clearSelection(); },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Arizalar" description="Barcha arizalarni boshqaring" icon={FileText} />

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input placeholder="Qidirish..." value={table.search} onChange={(e) => table.setSearch(e.target.value)} className="sm:max-w-xs" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-48"><SelectValue placeholder="Holat bo'yicha" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barchasi</SelectItem>
            {(Object.keys(applicationStatusLabels) as ApplicationStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{applicationStatusLabels[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {table.selectedIds.size > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={bulkDeleteMutation.isPending}>
            {table.selectedIds.size} ta o'chirish
          </Button>
        )}
      </div>

      {isLoading ? <TableSkeleton /> : table.filtered.length === 0 ? <EmptyState message="Arizalar topilmadi" /> : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={table.allSelected} onCheckedChange={table.toggleSelectAll} />
                </TableHead>
                <SortableHead field="fullName" sortBy={table.sortBy as string} sortOrder={table.sortOrder} onSort={(f) => table.toggleSort(f as keyof Application)}>Ism</SortableHead>
                <SortableHead field="email" sortBy={table.sortBy as string} sortOrder={table.sortOrder} onSort={(f) => table.toggleSort(f as keyof Application)}>Email</SortableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Holat</TableHead>
                <SortableHead field="createdAt" sortBy={table.sortBy as string} sortOrder={table.sortOrder} onSort={(f) => table.toggleSort(f as keyof Application)}>Sana</SortableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.filtered.map((item) => (
                <TableRow key={item.id} data-state={table.selectedIds.has(item.id) ? "selected" : undefined}>
                  <TableCell><Checkbox checked={table.selectedIds.has(item.id)} onCheckedChange={() => table.toggleSelect(item.id)} /></TableCell>
                  <TableCell className="font-medium">{item.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{item.email}</TableCell>
                  <TableCell className="text-muted-foreground">{item.phone}</TableCell>
                  <TableCell>
                    <StatusBadge variant={applicationStatusColors[item.status] as any}>{applicationStatusLabels[item.status]}</StatusBadge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(item.createdAt).toLocaleDateString("uz-UZ")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetailItem(item)}><Eye className="mr-2 h-4 w-4" /> Batafsil</DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Holatni o'zgartirish</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {(Object.keys(applicationStatusLabels) as ApplicationStatus[]).map((s) => (
                              <DropdownMenuItem key={s} onClick={() => handleStatusChange(item.id, s)}>{applicationStatusLabels[s]}</DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuItem onClick={() => setDeleteId(item.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> O'chirish
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>Ariza tafsilotlari</SheetTitle></SheetHeader>
          {detailItem && (
            <div className="mt-6 space-y-4">
              <div><p className="text-sm text-muted-foreground">To'liq ism</p><p className="font-medium">{detailItem.fullName}</p></div>
              <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{detailItem.email}</p></div>
              <div><p className="text-sm text-muted-foreground">Telefon</p><p className="font-medium">{detailItem.phone}</p></div>
              {detailItem.company && <div><p className="text-sm text-muted-foreground">Kompaniya</p><p className="font-medium">{detailItem.company}</p></div>}
              <div><p className="text-sm text-muted-foreground">Holat</p><StatusBadge variant={applicationStatusColors[detailItem.status] as any}>{applicationStatusLabels[detailItem.status]}</StatusBadge></div>
              {detailItem.message && <div><p className="text-sm text-muted-foreground">Xabar</p><p className="text-sm">{detailItem.message}</p></div>}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => {
        if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => { toast.success("Ariza o'chirildi"); setDeleteId(null); } });
      }} loading={deleteMutation.isPending} />
    </div>
  );
};

export default ApplicationsPage;

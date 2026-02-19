import { useState } from "react";
import { Mail, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { SortableHead } from "@/shared/ui/SortableHead";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { EmptyState, TableSkeleton } from "@/shared/ui/DataStates";
import { useGetList, useDelete, useBulkDelete, usePatchStatus, useUpdate } from "@/shared/api/query-hooks";
import { useTableState } from "@/shared/hooks/useTableState";
import { Contact, ContactStatus, contactStatusLabels, contactStatusColors } from "@/shared/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ContactsPage = () => {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<Contact | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const { data: rawItems = [], isLoading } = useGetList<Contact>("contacts", "/contacts");
  const deleteMutation = useDelete("contacts", "/contacts");
  const bulkDeleteMutation = useBulkDelete("contacts", "/contacts");
  const statusMutation = usePatchStatus("contacts", "/contacts");
  const updateMutation = useUpdate("contacts", "/contacts");

  const table = useTableState<Contact>({
    items: rawItems,
    searchFields: ["fullName", "email", "subject", "message"],
    filterField: "status",
    filterValue: statusFilter,
  });

  const handleStatusChange = (id: string, status: ContactStatus) => {
    statusMutation.mutate({ id, status }, { onSuccess: () => toast.success("Holat yangilandi") });
  };

  const handleSaveNote = () => {
    if (!detailItem) return;
    updateMutation.mutate({ id: detailItem.id, body: { adminNote } }, {
      onSuccess: () => { toast.success("Izoh saqlandi"); setDetailItem(null); },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Contactlar" description="Xabarlarni boshqaring" icon={Mail} />

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input placeholder="Qidirish..." value={table.search} onChange={(e) => table.setSearch(e.target.value)} className="sm:max-w-xs" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-48"><SelectValue placeholder="Holat" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barchasi</SelectItem>
            {(Object.keys(contactStatusLabels) as ContactStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{contactStatusLabels[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {table.selectedIds.size > 0 && (
          <Button variant="destructive" size="sm" onClick={() => bulkDeleteMutation.mutate([...table.selectedIds], { onSuccess: () => { toast.success("O'chirildi"); table.clearSelection(); } })} disabled={bulkDeleteMutation.isPending}>
            {table.selectedIds.size} ta o'chirish
          </Button>
        )}
      </div>

      {isLoading ? <TableSkeleton /> : table.filtered.length === 0 ? <EmptyState /> : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={table.allSelected} onCheckedChange={table.toggleSelectAll} /></TableHead>
                <SortableHead field="fullName" sortBy={table.sortBy as string} sortOrder={table.sortOrder} onSort={(f) => table.toggleSort(f as keyof Contact)}>Ism</SortableHead>
                <SortableHead field="email" sortBy={table.sortBy as string} sortOrder={table.sortOrder} onSort={(f) => table.toggleSort(f as keyof Contact)}>Email</SortableHead>
                <TableHead>Mavzu</TableHead>
                <TableHead>Holat</TableHead>
                <SortableHead field="createdAt" sortBy={table.sortBy as string} sortOrder={table.sortOrder} onSort={(f) => table.toggleSort(f as keyof Contact)}>Sana</SortableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.filtered.map((item) => (
                <TableRow key={item.id} data-state={table.selectedIds.has(item.id) ? "selected" : undefined}>
                  <TableCell><Checkbox checked={table.selectedIds.has(item.id)} onCheckedChange={() => table.toggleSelect(item.id)} /></TableCell>
                  <TableCell className="font-medium">{item.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{item.email}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">{item.subject}</TableCell>
                  <TableCell>
                    <StatusBadge variant={contactStatusColors[item.status] as any}>{contactStatusLabels[item.status]}</StatusBadge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(item.createdAt).toLocaleDateString("uz-UZ")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setDetailItem(item); setAdminNote(item.adminNote || ""); }}><Eye className="mr-2 h-4 w-4" /> Batafsil</DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Holatni o'zgartirish</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {(Object.keys(contactStatusLabels) as ContactStatus[]).map((s) => (
                              <DropdownMenuItem key={s} onClick={() => handleStatusChange(item.id, s)}>{contactStatusLabels[s]}</DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuItem onClick={() => setDeleteId(item.id)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> O'chirish</DropdownMenuItem>
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
          <SheetHeader><SheetTitle>Xabar tafsilotlari</SheetTitle></SheetHeader>
          {detailItem && (
            <div className="mt-6 space-y-4">
              <div><p className="text-sm text-muted-foreground">Ism</p><p className="font-medium">{detailItem.fullName}</p></div>
              <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{detailItem.email}</p></div>
              {detailItem.phone && <div><p className="text-sm text-muted-foreground">Telefon</p><p className="font-medium">{detailItem.phone}</p></div>}
              <div><p className="text-sm text-muted-foreground">Mavzu</p><p className="font-medium">{detailItem.subject}</p></div>
              <div><p className="text-sm text-muted-foreground">Xabar</p><p className="text-sm">{detailItem.message}</p></div>
              <div><p className="text-sm text-muted-foreground">Holat</p><StatusBadge variant={contactStatusColors[detailItem.status] as any}>{contactStatusLabels[detailItem.status]}</StatusBadge></div>
              <div className="pt-2 border-t border-border">
                <Label>Admin izohi</Label>
                <Textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={3} className="mt-2" />
                <Button size="sm" className="mt-2" onClick={handleSaveNote} disabled={updateMutation.isPending}>Saqlash</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => {
        if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => { toast.success("Xabar o'chirildi"); setDeleteId(null); } });
      }} loading={deleteMutation.isPending} />
    </div>
  );
};

export default ContactsPage;

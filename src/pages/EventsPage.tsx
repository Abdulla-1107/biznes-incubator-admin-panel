import { useState } from "react";
import { CalendarDays, MoreHorizontal, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { SortableHead } from "@/shared/ui/SortableHead";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { EmptyState, TableSkeleton } from "@/shared/ui/DataStates";
import { FileUpload } from "@/shared/ui/FileUpload";
import { useGetList, useCreate, useUpdate, useDelete, useBulkDelete } from "@/shared/api/query-hooks";
import { useTableState } from "@/shared/hooks/useTableState";
import { Event, EventFormat, EventCategory, eventFormatLabels, eventCategoryLabels } from "@/shared/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  titleUz: z.string().min(1, "Majburiy"),
  titleEn: z.string().optional(),
  titleRu: z.string().optional(),
  descriptionUz: z.string().optional(),
  date: z.string().min(1, "Majburiy"),
  endDate: z.string().optional(),
  format: z.string().min(1, "Majburiy"),
  category: z.string().min(1, "Majburiy"),
  maxParticipants: z.coerce.number().optional(),
  isFree: z.boolean().default(true),
  registrationDeadline: z.string().optional(),
  isActive: z.boolean().default(true),
  coverImage: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const EventsPage = () => {
  const [formatFilter, setFormatFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Event | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data: rawItems = [], isLoading } = useGetList<Event>("events", "/events");
  const createMutation = useCreate("events", "/events");
  const updateMutation = useUpdate("events", "/events");
  const deleteMutation = useDelete("events", "/events");
  const bulkDeleteMutation = useBulkDelete("events", "/events");

  const table = useTableState<Event>({
    items: rawItems,
    searchFields: ["titleUz", "titleEn", "titleRu", "descriptionUz"],
    filterField: "format",
    filterValue: formatFilter,
  });

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { titleUz: "", format: "OFFLINE", category: "WORKSHOP", isFree: true, isActive: true, coverImage: "" } });

  const openCreate = () => { setEditItem(null); form.reset({ titleUz: "", format: "OFFLINE", category: "WORKSHOP", isFree: true, isActive: true, date: "", coverImage: "" }); setFormOpen(true); };
  const openEdit = (item: Event) => {
    setEditItem(item);
    form.reset({
      titleUz: item.titleUz, titleEn: item.titleEn || "", titleRu: item.titleRu || "",
      descriptionUz: item.descriptionUz || "", date: item.date?.split("T")[0] || "", endDate: item.endDate?.split("T")[0] || "",
      format: item.format, category: item.category, maxParticipants: item.maxParticipants,
      isFree: item.isFree, registrationDeadline: item.registrationDeadline?.split("T")[0] || "", isActive: item.isActive,
      coverImage: item.coverImage || "",
    });
    setFormOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, body: values }, { onSuccess: () => { toast.success("Tadbir yangilandi"); setFormOpen(false); } });
    } else {
      createMutation.mutate(values, { onSuccess: () => { toast.success("Tadbir yaratildi"); setFormOpen(false); } });
    }
  };

  const isDeadlineSoon = (deadline?: string) => {
    if (!deadline) return false;
    const diff = new Date(deadline).getTime() - Date.now();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Tadbirlar" description="Tadbirlarni boshqaring" icon={CalendarDays} actionLabel="Yangi tadbir" onAction={openCreate} />

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input placeholder="Qidirish..." value={table.search} onChange={(e) => table.setSearch(e.target.value)} className="sm:max-w-xs" />
        <Select value={formatFilter} onValueChange={setFormatFilter}>
          <SelectTrigger className="sm:w-48"><SelectValue placeholder="Format" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barchasi</SelectItem>
            {(Object.keys(eventFormatLabels) as EventFormat[]).map((f) => (
              <SelectItem key={f} value={f}>{eventFormatLabels[f]}</SelectItem>
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
                <SortableHead field="titleUz" sortBy={table.sortBy as string} sortOrder={table.sortOrder} onSort={(f) => table.toggleSort(f as keyof Event)}>Nomi</SortableHead>
                <SortableHead field="date" sortBy={table.sortBy as string} sortOrder={table.sortOrder} onSort={(f) => table.toggleSort(f as keyof Event)}>Sana</SortableHead>
                <TableHead>Format</TableHead>
                <TableHead>Kategoriya</TableHead>
                <TableHead>Bepul</TableHead>
                <TableHead>Ro'yxat</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.filtered.map((item) => (
                <TableRow key={item.id} data-state={table.selectedIds.has(item.id) ? "selected" : undefined}>
                  <TableCell><Checkbox checked={table.selectedIds.has(item.id)} onCheckedChange={() => table.toggleSelect(item.id)} /></TableCell>
                  <TableCell className="font-medium">{item.titleUz}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(item.date).toLocaleDateString("uz-UZ")}</TableCell>
                  <TableCell><StatusBadge variant="info">{eventFormatLabels[item.format] || item.format}</StatusBadge></TableCell>
                  <TableCell><StatusBadge variant="muted">{eventCategoryLabels[item.category] || item.category}</StatusBadge></TableCell>
                  <TableCell>{item.isFree ? "Ha" : "Yo'q"}</TableCell>
                  <TableCell>
                    {isDeadlineSoon(item.registrationDeadline) && (
                      <span className="inline-flex items-center gap-1 text-xs text-warning"><AlertTriangle className="h-3 w-3" /> Yaqin</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(item)}><Pencil className="mr-2 h-4 w-4" /> Tahrirlash</DropdownMenuItem>
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? "Tadbirni tahrirlash" : "Yangi tadbir"}</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div><Label>Nomi (UZ) *</Label><Input {...form.register("titleUz")} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Nomi (EN)</Label><Input {...form.register("titleEn")} /></div>
              <div><Label>Nomi (RU)</Label><Input {...form.register("titleRu")} /></div>
            </div>
            <div><Label>Tavsif (UZ)</Label><Textarea {...form.register("descriptionUz")} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Sana *</Label><Input type="date" {...form.register("date")} /></div>
              <div><Label>Tugash sanasi</Label><Input type="date" {...form.register("endDate")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Format *</Label>
                <Select value={form.watch("format")} onValueChange={(v) => form.setValue("format", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.keys(eventFormatLabels) as EventFormat[]).map((f) => (<SelectItem key={f} value={f}>{eventFormatLabels[f]}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kategoriya *</Label>
                <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.keys(eventCategoryLabels) as EventCategory[]).map((c) => (<SelectItem key={c} value={c}>{eventCategoryLabels[c]}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Max ishtirokchilar</Label><Input type="number" {...form.register("maxParticipants")} /></div>
              <div><Label>Ro'yxat muddati</Label><Input type="date" {...form.register("registrationDeadline")} /></div>
            </div>
            <div><Label>Cover rasm</Label><FileUpload value={form.watch("coverImage")} onChange={(url) => form.setValue("coverImage", url)} /></div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.watch("isFree")} onCheckedChange={(v) => form.setValue("isFree", v)} /><Label>Bepul</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.watch("isActive")} onCheckedChange={(v) => form.setValue("isActive", v)} /><Label>Faol</Label></div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Bekor qilish</Button>
              <Button type="submit">{editItem ? "Saqlash" : "Yaratish"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => {
        if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => { toast.success("Tadbir o'chirildi"); setDeleteId(null); } });
      }} loading={deleteMutation.isPending} />
    </div>
  );
};

export default EventsPage;

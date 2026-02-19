import { useState } from "react";
import { Rocket, MoreHorizontal, Pencil, Trash2, Star } from "lucide-react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { SortableHead } from "@/shared/ui/SortableHead";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { EmptyState, TableSkeleton } from "@/shared/ui/DataStates";
import { FileUpload } from "@/shared/ui/FileUpload";
import { useGetList, useCreate, useUpdate, useDelete, useBulkDelete } from "@/shared/api/query-hooks";
import { useTableState } from "@/shared/hooks/useTableState";
import { Startup, StartupStage, startupStageLabels } from "@/shared/types";
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
  name: z.string().min(1, "Majburiy"),
  description: z.string().optional(),
  stage: z.string().min(1, "Majburiy"),
  industry: z.string().min(1, "Majburiy"),
  investment: z.coerce.number().optional(),
  foundedYear: z.coerce.number().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  logo: z.string().optional(),
  pitchDeck: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const StartupsPage = () => {
  const [stageFilter, setStageFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Startup | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data: rawItems = [], isLoading } = useGetList<Startup>("startups", "/startups");
  const createMutation = useCreate("startups", "/startups");
  const updateMutation = useUpdate("startups", "/startups");
  const deleteMutation = useDelete("startups", "/startups");
  const bulkDeleteMutation = useBulkDelete("startups", "/startups");

  const table = useTableState<Startup>({
    items: rawItems,
    searchFields: ["name", "description", "industry"],
    filterField: "stage",
    filterValue: stageFilter,
  });

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", stage: "IDEA", industry: "", isFeatured: false, isActive: true, logo: "", pitchDeck: "" } });

  const openCreate = () => { setEditItem(null); form.reset({ name: "", stage: "IDEA", industry: "", isFeatured: false, isActive: true, logo: "", pitchDeck: "" }); setFormOpen(true); };
  const openEdit = (item: Startup) => {
    setEditItem(item);
    form.reset({ name: item.name, description: item.description || "", stage: item.stage, industry: item.industry, investment: item.investment, foundedYear: item.foundedYear, isFeatured: item.isFeatured, isActive: item.isActive, logo: item.logo || "", pitchDeck: item.pitchDeck || "" });
    setFormOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, body: values }, { onSuccess: () => { toast.success("Startup yangilandi"); setFormOpen(false); } });
    } else {
      createMutation.mutate(values, { onSuccess: () => { toast.success("Startup yaratildi"); setFormOpen(false); } });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Startuplar" description="Startuplarni boshqaring" icon={Rocket} actionLabel="Yangi startup" onAction={openCreate} />

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input placeholder="Qidirish..." value={table.search} onChange={(e) => table.setSearch(e.target.value)} className="sm:max-w-xs" />
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="sm:w-48"><SelectValue placeholder="Bosqich" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barchasi</SelectItem>
            {(Object.keys(startupStageLabels) as StartupStage[]).map((s) => (
              <SelectItem key={s} value={s}>{startupStageLabels[s]}</SelectItem>
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
                <SortableHead field="name" sortBy={table.sortBy as string} sortOrder={table.sortOrder} onSort={(f) => table.toggleSort(f as keyof Startup)}>Nomi</SortableHead>
                <SortableHead field="industry" sortBy={table.sortBy as string} sortOrder={table.sortOrder} onSort={(f) => table.toggleSort(f as keyof Startup)}>Soha</SortableHead>
                <TableHead>Bosqich</TableHead>
                <SortableHead field="investment" sortBy={table.sortBy as string} sortOrder={table.sortOrder} onSort={(f) => table.toggleSort(f as keyof Startup)}>Investitsiya</SortableHead>
                <TableHead>Tanlangan</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.filtered.map((item) => (
                <TableRow key={item.id} data-state={table.selectedIds.has(item.id) ? "selected" : undefined}>
                  <TableCell><Checkbox checked={table.selectedIds.has(item.id)} onCheckedChange={() => table.toggleSelect(item.id)} /></TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.industry}</TableCell>
                  <TableCell><StatusBadge variant="info">{startupStageLabels[item.stage] || item.stage}</StatusBadge></TableCell>
                  <TableCell className="text-muted-foreground">{item.investment ? `$${item.investment.toLocaleString()}` : "—"}</TableCell>
                  <TableCell>{item.isFeatured ? <Star className="h-4 w-4 text-warning fill-warning" /> : "—"}</TableCell>
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
          <DialogHeader><DialogTitle>{editItem ? "Startupni tahrirlash" : "Yangi startup"}</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div><Label>Nomi *</Label><Input {...form.register("name")} /></div>
            <div><Label>Tavsif</Label><Textarea {...form.register("description")} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Soha *</Label><Input {...form.register("industry")} /></div>
              <div>
                <Label>Bosqich *</Label>
                <Select value={form.watch("stage")} onValueChange={(v) => form.setValue("stage", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.keys(startupStageLabels) as StartupStage[]).map((s) => (<SelectItem key={s} value={s}>{startupStageLabels[s]}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Investitsiya ($)</Label><Input type="number" {...form.register("investment")} /></div>
              <div><Label>Tashkil etilgan yil</Label><Input type="number" {...form.register("foundedYear")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Logo</Label><FileUpload value={form.watch("logo")} onChange={(url) => form.setValue("logo", url)} /></div>
              <div><Label>Pitch Deck</Label><FileUpload value={form.watch("pitchDeck")} onChange={(url) => form.setValue("pitchDeck", url)} accept=".pdf,.pptx,.ppt" label="Fayl yuklash" /></div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.watch("isFeatured")} onCheckedChange={(v) => form.setValue("isFeatured", v)} /><Label>Tanlangan</Label></div>
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
        if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => { toast.success("Startup o'chirildi"); setDeleteId(null); } });
      }} loading={deleteMutation.isPending} />
    </div>
  );
};

export default StartupsPage;

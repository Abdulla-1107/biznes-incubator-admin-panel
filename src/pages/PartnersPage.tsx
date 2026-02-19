import { useState } from "react";
import { Handshake, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { SortableHead } from "@/shared/ui/SortableHead";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { EmptyState, TableSkeleton } from "@/shared/ui/DataStates";
import { FileUpload } from "@/shared/ui/FileUpload";
import {
  useGetList,
  useCreate,
  useUpdate,
  useDelete,
  useBulkDelete,
} from "@/shared/api/query-hooks";
import { useTableState } from "@/shared/hooks/useTableState";
import { Partner, PartnerType, partnerTypeLabels } from "@/shared/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Majburiy"),
  websiteUrl: z.string().optional(),
  type: z.string().min(1, "Majburiy"),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
  logoUrl: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const PartnersPage = () => {
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Partner | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data: rawItems = [], isLoading } = useGetList<Partner>(
    "partners",
    "/partners",
  );
  const createMutation = useCreate("partners", "/partners");
  const updateMutation = useUpdate("partners", "/partners");
  const deleteMutation = useDelete("partners", "/partners");
  const bulkDeleteMutation = useBulkDelete("partners", "/partners");

  const table = useTableState<Partner>({
    items: rawItems,
    searchFields: ["name", "websiteUrl"],
    filterField: "type",
    filterValue: typeFilter,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: "OTHER",
      sortOrder: 0,
      isActive: true,
      logoUrl: "",
    },
  });

  const openCreate = () => {
    setEditItem(null);
    form.reset({
      name: "",
      type: "OTHER",
      sortOrder: 0,
      isActive: true,
      logoUrl: "",
    });
    setFormOpen(true);
  };
  const openEdit = (item: Partner) => {
    setEditItem(item);
    form.reset({
      name: item.name,
      websiteUrl: item.websiteUrl || "",
      type: item.type,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      logoUrl: item.logoUrl || "",
    });
    setFormOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    if (editItem) {
      updateMutation.mutate(
        { id: editItem.id, body: values },
        {
          onSuccess: () => {
            toast.success("Hamkor yangilandi");
            setFormOpen(false);
          },
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Hamkor yaratildi");
          setFormOpen(false);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hamkorlar"
        description="Hamkorlarni boshqaring"
        icon={Handshake}
        actionLabel="Yangi hamkor"
        onAction={openCreate}
      />

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input
          placeholder="Qidirish..."
          value={table.search}
          onChange={(e) => table.setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Turi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barchasi</SelectItem>
            {(Object.keys(partnerTypeLabels) as PartnerType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {partnerTypeLabels[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {table.selectedIds.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() =>
              bulkDeleteMutation.mutate([...table.selectedIds], {
                onSuccess: () => {
                  toast.success("O'chirildi");
                  table.clearSelection();
                },
              })
            }
            disabled={bulkDeleteMutation.isPending}
          >
            {table.selectedIds.size} ta o'chirish
          </Button>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : table.filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={table.allSelected}
                    onCheckedChange={table.toggleSelectAll}
                  />
                </TableHead>
                <SortableHead
                  field="name"
                  sortBy={table.sortBy as string}
                  sortOrder={table.sortOrder}
                  onSort={(f) => table.toggleSort(f as keyof Partner)}
                >
                  Nomi
                </SortableHead>
                <TableHead>Turi</TableHead>
                <TableHead>Veb-sayt</TableHead>
                <SortableHead
                  field="sortOrder"
                  sortBy={table.sortBy as string}
                  sortOrder={table.sortOrder}
                  onSort={(f) => table.toggleSort(f as keyof Partner)}
                >
                  Tartib
                </SortableHead>
                <TableHead>Faol</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.filtered.map((item : any) => (
                <TableRow
                  key={item.id}
                  data-state={
                    table.selectedIds.has(item.id) ? "selected" : undefined
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={table.selectedIds.has(item.id)}
                      onCheckedChange={() => table.toggleSelect(item.id)}
                    />
                  </TableCell>
                  {/* <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {item.logoUrl && (
                        <img
                          src={item.logoUrl}
                          alt={item.titleUz}
                          className="h-8 w-8 rounded object-cover"
                        />
                      )}
                      {item.titleUz}
                    </div>
                  </TableCell> */}
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <StatusBadge variant="muted">
                      {partnerTypeLabels[item.type] || item.type}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.websiteUrl || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.sortOrder}
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={item.isActive ? "success" : "muted"}>
                      {item.isActive ? "Faol" : "Nofaol"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(item)}>
                          <Pencil className="mr-2 h-4 w-4" /> Tahrirlash
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(item.id)}
                          className="text-destructive focus:text-destructive"
                        >
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Hamkorni tahrirlash" : "Yangi hamkor"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <div>
              <Label>Nomi *</Label>
              <Input {...form.register("name")} />
            </div>
            <div>
              <Label>Veb-sayt</Label>
              <Input {...form.register("websiteUrl")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Turi *</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(v) => form.setValue("type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(partnerTypeLabels) as PartnerType[]).map(
                      (t) => (
                        <SelectItem key={t} value={t}>
                          {partnerTypeLabels[t]}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tartib raqami</Label>
                <Input type="number" {...form.register("sortOrder")} />
              </div>
            </div>
            <div>
              <Label>Logo</Label>
              <FileUpload
                value={form.watch("logoUrl")}
                onChange={(url) => form.setValue("logoUrl", url)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.watch("isActive")}
                onCheckedChange={(v) => form.setValue("isActive", v)}
              />
              <Label>Faol</Label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button type="submit">{editItem ? "Saqlash" : "Yaratish"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId)
            deleteMutation.mutate(deleteId, {
              onSuccess: () => {
                toast.success("Hamkor o'chirildi");
                setDeleteId(null);
              },
            });
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default PartnersPage;

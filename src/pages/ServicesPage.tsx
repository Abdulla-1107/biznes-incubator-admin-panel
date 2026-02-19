import { useState } from "react";
import { Wrench, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import {
  Service,
  ServiceCategory,
  serviceCategoryLabels,
} from "@/shared/types";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type UploadFile = {
  url: string;
  filename: string;
  originalName: string;
  size: number;
};

// --- API mos schema ---
const serviceSchema = z.object({
  titleUz: z.string().min(1, "Majburiy"),
  titleEn: z.string().min(1, "Majburiy"),
  titleRu: z.string().min(1, "Majburiy"),
  descriptionUz: z.string().min(1, "Majburiy"),
  descriptionEn: z.string().min(1, "Majburiy"),
  descriptionRu: z.string().min(1, "Majburiy"),
  price: z.coerce.number().optional(),
  category: z.enum([
    "BUSINESS_MODEL",
    "LAUNCH",
    "TECHNICAL",
    "MARKETING_SALES",
    "EDUCATION",
    "INVESTMENT",
  ]),
  isPremium: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
  icon: z.string().optional(),
});

type ServiceForm = z.infer<typeof serviceSchema>;

const defaultValues: ServiceForm = {
  titleUz: "",
  titleEn: "",
  titleRu: "",
  descriptionUz: "",
  descriptionEn: "",
  descriptionRu: "",
  price: undefined,
  category: "BUSINESS_MODEL",
  isPremium: false,
  isActive: true,
  sortOrder: 0,
  icon: "",
};

const ServicesPage = () => {
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Service | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data: rawItems = [], isLoading } = useGetList<Service>(
    "services",
    "/services",
  );
  const createMutation = useCreate("services", "/services");
  const updateMutation = useUpdate("services", "/services");
  const deleteMutation = useDelete("services", "/services");
  const bulkDeleteMutation = useBulkDelete("services", "/services");

  const table = useTableState<Service>({
    items: rawItems,
    searchFields: ["titleUz", "titleEn", "titleRu", "descriptionUz"],
    filterField: "category",
    filterValue: categoryFilter,
  });

  const form = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues,
  });

  const openCreate = () => {
    setEditItem(null);
    form.reset(defaultValues);
    setFormOpen(true);
  };

  const openEdit = (item: Service) => {
    setEditItem(item);
    form.reset({
      titleUz: item.titleUz,
      titleEn: item.titleEn,
      titleRu: item.titleRu,
      descriptionUz: item.descriptionUz,
      descriptionEn: item.descriptionEn,
      descriptionRu: item.descriptionRu,
      price: item.price,
      category: item.category as ServiceCategory,
      isPremium: item.isPremium,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      icon: item.logo || "",
    });
    setFormOpen(true);
  };

  const onSubmit = (values: ServiceForm) => {
    console.log(values);

    const payload = {
      ...values,
      icon: values.icon ?? "", // undefined bo'lsa "" ketadi
    };

    if (editItem) {
      updateMutation.mutate(
        { id: editItem.id, body: payload },
        {
          onSuccess: () => {
            toast.success("Xizmat yangilandi");
            setFormOpen(false);
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Xizmat yaratildi");
          setFormOpen(false);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Xizmatlar"
        description="Xizmatlarni boshqaring"
        icon={Wrench}
        actionLabel="Yangi xizmat"
        onAction={openCreate}
      />

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input
          placeholder="Qidirish..."
          value={table.search}
          onChange={(e) => table.setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Kategoriya" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barchasi</SelectItem>
            {(Object.keys(serviceCategoryLabels) as ServiceCategory[]).map(
              (c) => (
                <SelectItem key={c} value={c}>
                  {serviceCategoryLabels[c]}
                </SelectItem>
              ),
            )}
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
        <EmptyState message="Xizmatlar topilmadi" />
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
                  field="titleUz"
                  sortBy={table.sortBy as string}
                  sortOrder={table.sortOrder}
                  onSort={(f) => table.toggleSort(f as keyof Service)}
                >
                  Nomi
                </SortableHead>
                <TableHead>Kategoriya</TableHead>
                <SortableHead
                  field="price"
                  sortBy={table.sortBy as string}
                  sortOrder={table.sortOrder}
                  onSort={(f) => table.toggleSort(f as keyof Service)}
                >
                  Narxi
                </SortableHead>
                <TableHead>Narxi</TableHead>
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
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {item.icon && (
                        <img
                          src={item.icon}
                          alt={item.titleUz}
                          className="h-8 w-8 rounded object-cover"
                        />
                      )}
                      {item.titleUz}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.titleUz}</TableCell>
                  <TableCell>
                    <StatusBadge variant="muted">
                      {serviceCategoryLabels[item.category] || item.category}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.price ? `${item.price.toLocaleString()} so'm` : "—"}
                  </TableCell>
                  {/* <TableCell>{item.isPremium ? "✓" : "—"}</TableCell> */}
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Xizmatni tahrirlash" : "Yangi xizmat"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <div>
              <Label>Nomi (UZ) *</Label>
              <Input {...form.register("titleUz")} />
              {form.formState.errors.titleUz && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.titleUz.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nomi (EN) *</Label>
                <Input {...form.register("titleEn")} />
                {form.formState.errors.titleEn && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.titleEn.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Nomi (RU) *</Label>
                <Input {...form.register("titleRu")} />
                {form.formState.errors.titleRu && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.titleRu.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label>Tavsif (UZ) *</Label>
              <Textarea {...form.register("descriptionUz")} rows={3} />
              {form.formState.errors.descriptionUz && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.descriptionUz.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tavsif (EN) *</Label>
                <Textarea {...form.register("descriptionEn")} rows={3} />
                {form.formState.errors.descriptionEn && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.descriptionEn.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Tavsif (RU) *</Label>
                <Textarea {...form.register("descriptionRu")} rows={3} />
                {form.formState.errors.descriptionRu && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.descriptionRu.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Narxi</Label>
                <Input type="number" {...form.register("price")} />
              </div>
              <div>
                <Label>Kategoriya *</Label>
                <Select
                  value={form.watch("category")}
                  onValueChange={(v) =>
                    form.setValue("category", v as ServiceCategory)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.keys(serviceCategoryLabels) as ServiceCategory[]
                    ).map((c) => (
                      <SelectItem key={c} value={c}>
                        {serviceCategoryLabels[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Tartib raqami</Label>
              <Input type="number" {...form.register("sortOrder")} />
            </div>
            <div>
              <Label>Logo</Label>
              <FileUpload
                value={form.watch("icon")}
                onChange={(file: any) => form.setValue("icon", file)}
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.watch("isPremium")}
                  onCheckedChange={(v) => form.setValue("isPremium", v)}
                />
                <Label>Premium</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.watch("isActive")}
                  onCheckedChange={(v) => form.setValue("isActive", v)}
                />
                <Label>Faol</Label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editItem ? "Saqlash" : "Yaratish"}
              </Button>
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
                toast.success("Xizmat o'chirildi");
                setDeleteId(null);
              },
            });
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ServicesPage;

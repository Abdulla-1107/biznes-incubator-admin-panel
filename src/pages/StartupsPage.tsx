import { useState } from "react";
import {
  Rocket,
  MoreHorizontal,
  Pencil,
  Trash2,
  Star,
  Globe,
  Users,
  Calendar,
} from "lucide-react";
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
  Startup,
  StartupStage,
  StartupIndustry,
  startupStageLabels,
  startupIndustryLabels,
} from "@/shared/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  nameUz: z.string().min(1, "Majburiy"),
  nameEn: z.string().min(1, "Majburiy"),
  nameRu: z.string().min(1, "Majburiy"),

  descriptionUz: z.string().min(1, "Majburiy"),
  descriptionEn: z.string().min(1, "Majburiy"),
  descriptionRu: z.string().min(1, "Majburiy"),

  shortDescriptionUz: z.string().optional(),
  shortDescriptionEn: z.string().optional(),
  shortDescriptionRu: z.string().optional(),

  stage: z.enum(["IDEA", "MVP", "EARLY", "GROWTH", "SCALE"]).optional(),
  industry: z
    .enum([
      "FINTECH",
      "EDTECH",
      "HEALTHTECH",
      "AGRITECH",
      "ECOMMERCE",
      "LOGISTICS",
      "AI_ML",
      "SAAS",
      "OTHER",
    ])
    .optional(),

  logoUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  pitchDeck: z.string().optional(),

  founderName: z.string().optional(),
  founderEmail: z
    .string()
    .email("Email noto'g'ri")
    .optional()
    .or(z.literal("")),

  teamSize: z.coerce.number().optional(),
  foundedYear: z.coerce.number().optional(),
  investmentRaised: z.coerce.number().optional(),

  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  nameUz: "",
  nameEn: "",
  nameRu: "",
  descriptionUz: "",
  descriptionEn: "",
  descriptionRu: "",
  shortDescriptionUz: "",
  shortDescriptionEn: "",
  shortDescriptionRu: "",
  stage: "IDEA",
  industry: undefined,
  logoUrl: "",
  websiteUrl: "",
  pitchDeck: "",
  founderName: "",
  founderEmail: "",
  teamSize: undefined,
  foundedYear: undefined,
  investmentRaised: undefined,
  isActive: true,
  isFeatured: false,
  sortOrder: 0,
};

const stageVariant: Record<
  StartupStage,
  "info" | "success" | "warning" | "muted"
> = {
  IDEA: "muted",
  MVP: "info",
  EARLY: "warning",
  GROWTH: "success",
  SCALE: "success",
};

// ─── Component ────────────────────────────────────────────────────────────────
const StartupsPage = () => {
  const [stageFilter, setStageFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Startup | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data: rawItems = [], isLoading } = useGetList<Startup>(
    "startups",
    "/startups",
  );
  const createMutation = useCreate("startups", "/startups");
  const updateMutation = useUpdate("startups", "/startups");
  const deleteMutation = useDelete("startups", "/startups");
  const bulkDeleteMutation = useBulkDelete("startups", "/startups");

  const table = useTableState<Startup>({
    items: rawItems,
    searchFields: ["nameUz", "nameEn", "founderName"],
    filterField: "stage",
    filterValue: stageFilter === "ALL" ? undefined : stageFilter,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const openCreate = () => {
    setEditItem(null);
    form.reset(defaultValues);
    setFormOpen(true);
  };

  const openEdit = (item: Startup) => {
    setEditItem(item);
    form.reset({
      nameUz: item.nameUz,
      nameEn: item.nameEn,
      nameRu: item.nameRu,
      descriptionUz: item.descriptionUz,
      descriptionEn: item.descriptionEn,
      descriptionRu: item.descriptionRu,
      stage: item.stage,
      industry: item.industry,
      logoUrl: item.logoUrl ?? "",
      websiteUrl: item.websiteUrl ?? "",
      pitchDeck: item.pitchDeck ?? "",
      founderName: item.founderName ?? "",
      founderEmail: item.founderEmail ?? "",
      teamSize: item.teamSize,
      foundedYear: item.foundedYear,
      investmentRaised: item.investmentRaised,
      isActive: item.isActive,
      isFeatured: item.isFeatured,
      sortOrder: item.sortOrder,
    });
    setFormOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    if (editItem) {
      updateMutation.mutate(
        { id: editItem.id, body: values },
        {
          onSuccess: () => {
            toast.success("Startup yangilandi");
            setFormOpen(false);
          },
          onError: () => toast.error("Xatolik yuz berdi"),
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Startup yaratildi");
          setFormOpen(false);
        },
        onError: () => toast.error("Xatolik yuz berdi"),
      });
    }
  };

  const err = form.formState.errors;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Startuplar"
        description="Startuplarni boshqaring"
        icon={Rocket}
        actionLabel="Yangi startup"
        onAction={openCreate}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input
          placeholder="Qidirish (nomi, asoschisi)..."
          value={table.search}
          onChange={(e) => table.setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Bosqich" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barchasi</SelectItem>
            {(Object.keys(startupStageLabels) as StartupStage[]).map((s) => (
              <SelectItem key={s} value={s}>
                {startupStageLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {table.selectedIds.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            disabled={bulkDeleteMutation.isPending}
            onClick={() =>
              bulkDeleteMutation.mutate([...table.selectedIds], {
                onSuccess: () => {
                  toast.success("O'chirildi");
                  table.clearSelection();
                },
                onError: () => toast.error("Xatolik yuz berdi"),
              })
            }
          >
            {table.selectedIds.size} ta o'chirish
          </Button>
        )}
      </div>

      {/* Table */}
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
                  field="nameUz"
                  sortBy={table.sortBy as string}
                  sortOrder={table.sortOrder}
                  onSort={(f) => table.toggleSort(f as keyof Startup)}
                >
                  Startup
                </SortableHead>
                <SortableHead
                  field="industry"
                  sortBy={table.sortBy as string}
                  sortOrder={table.sortOrder}
                  onSort={(f) => table.toggleSort(f as keyof Startup)}
                >
                  Soha
                </SortableHead>
                <SortableHead
                  field="stage"
                  sortBy={table.sortBy as string}
                  sortOrder={table.sortOrder}
                  onSort={(f) => table.toggleSort(f as keyof Startup)}
                >
                  Bosqich
                </SortableHead>
                <TableHead>Asoschisi</TableHead>
                <SortableHead
                  field="investmentRaised"
                  sortBy={table.sortBy as string}
                  sortOrder={table.sortOrder}
                  onSort={(f) => table.toggleSort(f as keyof Startup)}
                >
                  Investitsiya
                </SortableHead>
                <TableHead>Jamoa / Yil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.filtered.map((item) => (
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

                  {/* Startup nomi + logo */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.logoUrl ? (
                        <img
                          src={item.logoUrl}
                          alt={item.nameUz}
                          className="h-9 w-9 rounded-lg object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Rocket className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-medium text-sm">
                          {item.nameUz}
                          {item.isFeatured && (
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                          )}
                        </div>
                        {item.websiteUrl && (
                          <a
                            href={item.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors truncate max-w-[180px]"
                          >
                            <Globe className="h-3 w-3 shrink-0" />
                            {item.websiteUrl.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Soha */}
                  <TableCell>
                    {item.industry ? (
                      <Badge variant="secondary" className="text-xs">
                        {startupIndustryLabels[item.industry] ?? item.industry}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Bosqich */}
                  <TableCell>
                    {item.stage ? (
                      <StatusBadge variant={stageVariant[item.stage]}>
                        {startupStageLabels[item.stage]}
                      </StatusBadge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Asoschisi */}
                  <TableCell>
                    {item.founderName ? (
                      <div className="text-sm">
                        <div className="font-medium">{item.founderName}</div>
                        {item.founderEmail && (
                          <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                            {item.founderEmail}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Investitsiya */}
                  <TableCell>
                    {item.investmentRaised != null ? (
                      <span className="font-medium text-sm">
                        ${Number(item.investmentRaised).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Jamoa / Yil */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      {item.teamSize != null && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {item.teamSize} kishi
                        </span>
                      )}
                      {item.foundedYear != null && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {item.foundedYear}
                        </span>
                      )}
                      {item.teamSize == null && item.foundedYear == null && "—"}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge variant={item.isActive ? "success" : "muted"}>
                      {item.isActive ? "Faol" : "Nofaol"}
                    </StatusBadge>
                  </TableCell>

                  {/* Actions */}
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

      {/* Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Startupni tahrirlash" : "Yangi startup"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 mt-4"
          >
            {/* Nomi */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Nomi *
              </p>
              <div className="grid grid-cols-3 gap-3">
                {(["nameUz", "nameEn", "nameRu"] as const).map((f, i) => (
                  <div key={f}>
                    <Label>{["UZ", "EN", "RU"][i]}</Label>
                    <Input {...form.register(f)} />
                    {err[f] && (
                      <p className="text-xs text-destructive mt-1">
                        {err[f]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tavsif */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Tavsif *
              </p>
              <div className="grid grid-cols-3 gap-3">
                {(
                  ["descriptionUz", "descriptionEn", "descriptionRu"] as const
                ).map((f, i) => (
                  <div key={f}>
                    <Label>{["UZ", "EN", "RU"][i]}</Label>
                    <Textarea {...form.register(f)} rows={3} />
                    {err[f] && (
                      <p className="text-xs text-destructive mt-1">
                        {err[f]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Soha / Bosqich */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Soha</Label>
                <Select
                  value={form.watch("industry") ?? ""}
                  onValueChange={(v) =>
                    form.setValue("industry", v as StartupIndustry)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.keys(startupIndustryLabels) as StartupIndustry[]
                    ).map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {startupIndustryLabels[ind]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bosqich</Label>
                <Select
                  value={form.watch("stage") ?? ""}
                  onValueChange={(v) =>
                    form.setValue("stage", v as StartupStage)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(startupStageLabels) as StartupStage[]).map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {startupStageLabels[s]}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Raqamlar */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Investitsiya ($)</Label>
                <Input type="number" {...form.register("investmentRaised")} />
              </div>
              <div>
                <Label>Tashkil etilgan yil</Label>
                <Input type="number" {...form.register("foundedYear")} />
              </div>
              <div>
                <Label>Jamoa soni</Label>
                <Input type="number" {...form.register("teamSize")} />
              </div>
            </div>

            {/* Asoschisi */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Asoschining ismi</Label>
                <Input {...form.register("founderName")} />
              </div>
              <div>
                <Label>Asoschining emaili</Label>
                <Input type="email" {...form.register("founderEmail")} />
                {err.founderEmail && (
                  <p className="text-xs text-destructive mt-1">
                    {err.founderEmail.message}
                  </p>
                )}
              </div>
            </div>

            {/* Veb-sayt */}
            <div>
              <Label>Veb-sayt</Label>
              <Input
                placeholder="https://example.com"
                {...form.register("websiteUrl")}
              />
            </div>

            {/* Fayllar */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Logo</Label>
                <FileUpload
                  value={form.watch("logoUrl")}
                  onChange={(url) => form.setValue("logoUrl", url)}
                />
              </div>
              {/* <div>
                <Label>Pitch Deck</Label>
                <FileUpload
                  value={form.watch("pitchDeck")}
                  onChange={(url) => form.setValue("pitchDeck", url)}
                  accept=".pdf,.pptx,.ppt"
                  label="Fayl yuklash"
                />
              </div> */}
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch
                  id="isFeatured"
                  checked={form.watch("isFeatured")}
                  onCheckedChange={(v) => form.setValue("isFeatured", v)}
                />
                <Label htmlFor="isFeatured">Tanlangan ⭐</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={(v) => form.setValue("isActive", v)}
                />
                <Label htmlFor="isActive">Faol</Label>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Label>Tartib raqami</Label>
                <Input
                  type="number"
                  className="w-24"
                  {...form.register("sortOrder")}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
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
                toast.success("Startup o'chirildi");
                setDeleteId(null);
              },
              onError: () => toast.error("Xatolik yuz berdi"),
            });
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default StartupsPage;

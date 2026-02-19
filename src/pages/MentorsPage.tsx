import { useState } from "react";
import {
  GraduationCap,
  MoreHorizontal,
  Pencil,
  Trash2,
  Star,
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
  Mentor,
  MentorSpecialization,
  mentorSpecializationLabels,
} from "@/shared/types";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

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

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const schema = z.object({
  fullName: z.string().min(1, "Majburiy"),
  bioUz: z.string().optional(),

  specialization: z.enum([
    "BUSINESS",
    "TECHNOLOGY",
    "MARKETING",
    "FINANCE",
    "LEGAL",
    "DESIGN",
    "HR",
    "OTHER",
  ]),

  experienceYears: z.coerce.number().min(0),

  photoUrl: z.string().optional(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const MentorsPage = () => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Mentor | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data: rawItems = [], isLoading } = useGetList<Mentor>(
    "mentors",
    "/mentors",
  );

  const createMutation = useCreate("mentors", "/mentors");
  const updateMutation = useUpdate("mentors", "/mentors");
  const deleteMutation = useDelete("mentors", "/mentors");
  const bulkDeleteMutation = useBulkDelete("mentors", "/mentors");

  const table = useTableState<Mentor>({
    items: rawItems,
    searchFields: ["fullName", "specialization", "bio"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      specialization: "BUSINESS",
      experienceYears: 0,
      photoUrl: "",
      isFeatured: false,
      isActive: true,
    },
  });

  const openCreate = () => {
    setEditItem(null);
    form.reset({
      fullName: "",
      specialization: "BUSINESS",
      experienceYears: 0,
      photoUrl: "",
      isFeatured: false,
      isActive: true,
    });
    setFormOpen(true);
  };

  const openEdit = (item: Mentor) => {
    setEditItem(item);

    form.reset({
      fullName: item.fullName,
      bioUz: item.bio || "",
      photoUrl: item.photoUrl || "",
      specialization: item.specialization,
      experienceYears: item.experienceYears,
      isFeatured: item.isFeatured,
      isActive: item.isActive,
    });

    setFormOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    if (editItem) {
      updateMutation.mutate(
        { id: editItem.id, body: values },
        {
          onSuccess: () => {
            toast.success("Mentor yangilandi");
            setFormOpen(false);
          },
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Mentor yaratildi");
          setFormOpen(false);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mentorlar"
        description="Mentorlarni boshqaring"
        icon={GraduationCap}
        actionLabel="Yangi mentor"
        onAction={openCreate}
      />

      {/* SEARCH + BULK DELETE */}
      <div className="flex gap-3">
        <Input
          placeholder="Qidirish..."
          value={table.search}
          onChange={(e) => table.setSearch(e.target.value)}
          className="max-w-xs"
        />

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
          >
            {table.selectedIds.size} ta o'chirish
          </Button>
        )}
      </div>

      {/* TABLE */}
      {isLoading ? (
        <TableSkeleton />
      ) : table.filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
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
                  field="photo"
                  sortBy={table.sortBy as string}
                  sortOrder={table.sortOrder}
                  onSort={(f) => table.toggleSort(f as keyof Mentor)}
                >
                  Rasm
                </SortableHead>
                <SortableHead
                  field="fullName"
                  sortBy={table.sortBy as string}
                  sortOrder={table.sortOrder}
                  onSort={(f) => table.toggleSort(f as keyof Mentor)}
                >
                  Ism
                </SortableHead>

                <TableHead>Mutaxassislik</TableHead>
                <TableHead>Tajriba</TableHead>
                <TableHead>Tanlangan</TableHead>
                <TableHead>Faol</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {table.filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={table.selectedIds.has(item.id)}
                      onCheckedChange={() => table.toggleSelect(item.id)}
                    />
                  </TableCell>

                  <TableCell>
                    <Avatar
                      onClick={() => window.open(item.photoUrl)}
                      className="h-10 w-10 cursor-pointer"
                    >
                      <AvatarImage src={item.photoUrl} />
                      <AvatarFallback>IMG</AvatarFallback>
                    </Avatar>
                  </TableCell>

                  <TableCell className="font-medium">{item.fullName}</TableCell>

                  <TableCell>
                    {mentorSpecializationLabels[item.specialization]}
                  </TableCell>

                  <TableCell>{item.experienceYears} yil</TableCell>

                  <TableCell>
                    {item.isFeatured ? (
                      <Star className="h-4 w-4 text-warning fill-warning" />
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  <TableCell>
                    <StatusBadge variant={item.isActive ? "success" : "muted"}>
                      {item.isActive ? "Faol" : "Nofaol"}
                    </StatusBadge>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(item)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Tahrirlash
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => setDeleteId(item.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          O'chirish
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

      {/* FORM DIALOG */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Mentorni tahrirlash" : "Yangi mentor"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <div>
              <Label>To'liq ism *</Label>
              <Input {...form.register("fullName")} />
            </div>

            <div>
              <Label>Mutaxassislik *</Label>

              <Select
                value={form.watch("specialization")}
                onValueChange={(v) =>
                  form.setValue("specialization", v as MentorSpecialization)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {(
                    Object.keys(
                      mentorSpecializationLabels,
                    ) as MentorSpecialization[]
                  ).map((key) => (
                    <SelectItem key={key} value={key}>
                      {mentorSpecializationLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Bio</Label>
              <Textarea {...form.register("bioUz")} rows={3} />
            </div>

            <div>
              <Label>Tajriba (yil)</Label>
              <Input type="number" {...form.register("experienceYears")} />
            </div>

            <div>
              <Label>Rasm</Label>
              <FileUpload
                value={form.watch("photoUrl")}
                onChange={(url: string) => form.setValue("photoUrl", url)}
              />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.watch("isFeatured")}
                  onCheckedChange={(v) => form.setValue("isFeatured", v)}
                />
                <Label>Tanlangan</Label>
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

              <Button type="submit">{editItem ? "Saqlash" : "Yaratish"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId)
            deleteMutation.mutate(deleteId, {
              onSuccess: () => {
                toast.success("Mentor o'chirildi");
                setDeleteId(null);
              },
            });
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default MentorsPage;

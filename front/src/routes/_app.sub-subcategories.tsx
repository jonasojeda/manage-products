import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layers, Plus, Pencil, Trash2, Loader2, FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/sub-subcategories")({
  head: () => ({ meta: [{ title: "Sub-subcategories Lvl 3 — Prodly" }] }),
  component: SubSubcategoriesPage,
});

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  category?: Category;
}

interface SubSubcategory {
  id: number;
  subcategory_id: number;
  name: string;
  subcategory?: Subcategory;
}

function SubSubcategoriesPage() {
  const [subSubcategories, setSubSubcategories] = useState<SubSubcategory[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Add sub-subcategory states
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");

  // Edit sub-subcategory states
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const fetchData = async () => {
    try {
      const [subsubData, subData] = await Promise.all([
        apiRequest("sub-subcategories"),
        apiRequest("subcategories"),
      ]);
      setSubSubcategories(subsubData || []);
      setSubcategories(subData || []);
    } catch (err) {
      console.error("Failed to fetch sub-subcategories data", err);
      toast.error("Failed to load sub-subcategories or parent subcategories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const add = async () => {
    if (!name.trim()) {
      toast.error("Sub-subcategory name is required.");
      return;
    }
    if (!subcategoryId) {
      toast.error("Parent subcategory is required.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Adding sub-subcategory...");

    try {
      await apiRequest("sub-subcategories", {
        method: "POST",
        body: JSON.stringify({
          subcategory_id: parseInt(subcategoryId),
          name: name.trim(),
        }),
      });

      toast.success("Sub-subcategory added successfully!", { id: toastId });
      setOpen(false);
      setName("");
      setSubcategoryId("");
      await fetchData();
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.errors
        ? Object.values(err.errors).flat().join(" ")
        : err.message || "Failed to save sub-subcategory.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (id: number, currentName: string) => {
    setEditId(id);
    setEditName(currentName);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editName.trim() || !editId) {
      toast.error("Sub-subcategory name is required.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Updating name...");

    try {
      await apiRequest(`sub-subcategories/${editId}`, {
        method: "PUT",
        body: JSON.stringify({ name: editName.trim() }),
      });

      toast.success("Sub-subcategory updated successfully!", { id: toastId });
      setEditOpen(false);
      setEditName("");
      setEditId(null);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.errors
        ? Object.values(err.errors).flat().join(" ")
        : err.message || "Failed to update sub-subcategory.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this sub-subcategory?"
    );
    if (!isConfirmed) return;

    const toastId = toast.loading("Deleting sub-subcategory...");
    try {
      await apiRequest(`sub-subcategories/${id}`, { method: "DELETE" });
      toast.success("Sub-subcategory deleted successfully!", { id: toastId });
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete sub-subcategory.", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading sub-subcategories...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sub-subcategories Level 3</h1>
          <p className="text-sm text-muted-foreground">Manage sub-subcategories and assign them to parent Level 2 subcategories.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Sub-subcat Lvl 3
        </Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Sub-subcategory Name</TableHead>
                <TableHead>Parent Subcategory (Lvl 2)</TableHead>
                <TableHead>Parent Category (Lvl 1)</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subSubcategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    No sub-subcategories created yet. Click "Add Sub-subcat Lvl 3" to begin.
                  </TableCell>
                </TableRow>
              ) : (
                subSubcategories.map((ss) => (
                  <TableRow key={ss.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{ss.id}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-cyan-500" />
                        {ss.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <FolderOpen className="h-3.5 w-3.5" />
                        {ss.subcategory?.name || <span className="italic text-destructive">None</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {ss.subcategory?.category?.name || <span className="italic text-destructive">None</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(ss.id, ss.name)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => remove(ss.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sub-subcategory Level 3</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="parent-subcategory">Parent Subcategory Lvl 2</Label>
              <Select value={subcategoryId} onValueChange={setSubcategoryId}>
                <SelectTrigger id="parent-subcategory">
                  <SelectValue placeholder="Select parent subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name} {s.category ? `(${s.category.name})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-subcategory-name">Name</Label>
              <Input
                id="sub-subcategory-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Laptops"
                disabled={saving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={add} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Sub-subcategory Level 3</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-sub-subcategory-name">Name</Label>
              <Input
                id="edit-sub-subcategory-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Name"
                disabled={saving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

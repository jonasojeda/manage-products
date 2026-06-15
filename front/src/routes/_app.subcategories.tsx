import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FolderOpen, Plus, Pencil, Trash2, Loader2, FolderTree } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/subcategories")({
  head: () => ({ meta: [{ title: "Subcategories Lvl 2 — Prodly" }] }),
  component: SubcategoriesPage,
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

function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Add subcategory states
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Edit subcategory states
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const fetchData = async () => {
    try {
      const [subData, catData] = await Promise.all([
        apiRequest("subcategories"),
        apiRequest("categories"),
      ]);
      setSubcategories(subData || []);
      setCategories(catData || []);
    } catch (err) {
      console.error("Failed to fetch subcategories data", err);
      toast.error("Failed to load subcategories or parent categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const add = async () => {
    if (!name.trim()) {
      toast.error("Subcategory name is required.");
      return;
    }
    if (!categoryId) {
      toast.error("Parent category is required.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Adding subcategory...");

    try {
      await apiRequest("subcategories", {
        method: "POST",
        body: JSON.stringify({
          category_id: parseInt(categoryId),
          name: name.trim(),
        }),
      });

      toast.success("Subcategory added successfully!", { id: toastId });
      setOpen(false);
      setName("");
      setCategoryId("");
      await fetchData();
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.errors
        ? Object.values(err.errors).flat().join(" ")
        : err.message || "Failed to save subcategory.";
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
      toast.error("Subcategory name is required.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Updating name...");

    try {
      await apiRequest(`subcategories/${editId}`, {
        method: "PUT",
        body: JSON.stringify({ name: editName.trim() }),
      });

      toast.success("Subcategory updated successfully!", { id: toastId });
      setEditOpen(false);
      setEditName("");
      setEditId(null);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.errors
        ? Object.values(err.errors).flat().join(" ")
        : err.message || "Failed to update subcategory.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this subcategory? All nested sub-subcategories will also be deleted."
    );
    if (!isConfirmed) return;

    const toastId = toast.loading("Deleting subcategory...");
    try {
      await apiRequest(`subcategories/${id}`, { method: "DELETE" });
      toast.success("Subcategory deleted successfully!", { id: toastId });
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete subcategory.", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading subcategories...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subcategories Level 2</h1>
          <p className="text-sm text-muted-foreground">Manage subcategories and assign them to parent Level 1 categories.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Subcategory Lvl 2
        </Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Subcategory Name</TableHead>
                <TableHead>Parent Category (Lvl 1)</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                    No subcategories created yet. Click "Add Subcategory Lvl 2" to begin.
                  </TableCell>
                </TableRow>
              ) : (
                subcategories.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{s.id}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-teal-500" />
                        {s.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <FolderTree className="h-3.5 w-3.5" />
                        {s.category?.name || <span className="italic text-destructive">None</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(s.id, s.name)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => remove(s.id)}>
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
            <DialogTitle>Add Subcategory Level 2</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="parent-category">Parent Category Lvl 1</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="parent-category">
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory-name">Name</Label>
              <Input
                id="subcategory-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Computers"
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
            <DialogTitle>Rename Subcategory Level 2</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-subcategory-name">Name</Label>
              <Input
                id="edit-subcategory-name"
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

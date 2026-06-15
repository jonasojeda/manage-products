import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/brands")({
  head: () => ({ meta: [{ title: "Brands — Prodly" }] }),
  component: BrandsPage,
});

interface Brand {
  id: number;
  name: string;
  created_at: string;
}

function BrandsPage() {
  const [list, setList] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [name, setName] = useState("");

  const fetchBrands = async () => {
    try {
      const data = await apiRequest("brands");
      setList(data || []);
    } catch (err) {
      console.error("Failed to load brands", err);
      toast.error("Failed to load brands from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openNew = () => {
    setEditing(null);
    setName("");
    setOpen(true);
  };

  const openEdit = (b: Brand) => {
    setEditing(b);
    setName(b.name);
    setOpen(true);
  };

  const save = async () => {
    if (!name.trim()) {
      toast.error("Brand name is required.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(editing ? "Updating brand..." : "Creating brand...");

    try {
      if (editing) {
        await apiRequest(`brands/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify({ name: name.trim() }),
        });
        toast.success("Brand updated successfully!", { id: toastId });
      } else {
        await apiRequest("brands", {
          method: "POST",
          body: JSON.stringify({ name: name.trim() }),
        });
        toast.success("Brand created successfully!", { id: toastId });
      }
      setOpen(false);
      setName("");
      await fetchBrands();
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.errors
        ? Object.values(err.errors).flat().join(" ")
        : err.message || "Failed to save brand.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this brand? All products assigned to this brand will have their association updated."
    );
    if (!isConfirmed) return;

    const toastId = toast.loading("Deleting brand...");
    try {
      await apiRequest(`brands/${id}`, { method: "DELETE" });
      toast.success("Brand deleted successfully!", { id: toastId });
      await fetchBrands();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete brand.", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading brands list...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Brands</h1>
          <p className="text-sm text-muted-foreground">Manage product brands.</p>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="mr-2 h-4 w-4" />Add Brand</Button>
      </div>

      <Card className="border-border">
        {list.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No brands created yet. Click "Add Brand" to begin.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">ID</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{b.id}</TableCell>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {b.created_at ? b.created_at.slice(0, 10) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b)} disabled={saving}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(b.id)} disabled={saving}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit brand" : "Add brand"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="brand-name">Brand name</Label>
            <Input
              id="brand-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              disabled={saving}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

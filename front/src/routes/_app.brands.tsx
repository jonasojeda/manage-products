import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { brands as seed, type Brand } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/brands")({
  head: () => ({ meta: [{ title: "Brands — Prodly" }] }),
  component: BrandsPage,
});

function BrandsPage() {
  const [list, setList] = useState<Brand[]>(seed);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [name, setName] = useState("");

  const openNew = () => { setEditing(null); setName(""); setOpen(true); };
  const openEdit = (b: Brand) => { setEditing(b); setName(b.name); setOpen(true); };

  const save = () => {
    if (!name.trim()) return;
    if (editing) {
      setList((l) => l.map((b) => (b.id === editing.id ? { ...b, name } : b)));
      toast.success("Brand updated");
    } else {
      setList((l) => [...l, { id: `b_${Date.now()}`, name, createdAt: new Date().toISOString().slice(0, 10) }]);
      toast.success("Brand created");
    }
    setOpen(false);
  };

  const remove = (id: string) => { setList((l) => l.filter((b) => b.id !== id)); toast.success("Brand deleted"); };

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
                <TableCell className="text-muted-foreground">{b.createdAt}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit brand" : "Add brand"}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="brand-name">Brand name</Label>
            <Input id="brand-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Corp" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

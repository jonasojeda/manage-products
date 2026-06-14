import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, FolderTree, Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { categories as seed } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/categories")({
  head: () => ({ meta: [{ title: "Categories — Prodly" }] }),
  component: CategoriesPage,
});

type Tree = typeof seed;

function CategoriesPage() {
  const [tree, setTree] = useState<Tree>(seed);
  const [open, setOpen] = useState(false);
  const [cat1, setCat1] = useState("");
  const [cat2, setCat2] = useState("");
  const [cat3, setCat3] = useState("");

  const add = () => {
    if (!cat1) return;
    setTree((prev) => {
      const copy = prev.map((c) => ({ ...c, children: c.children.map((cc) => ({ ...cc, children: [...cc.children] })) }));
      let n1 = copy.find((c) => c.cat1 === cat1);
      if (!n1) { n1 = { cat1, children: [] }; copy.push(n1); }
      if (cat2) {
        let n2 = n1.children.find((c) => c.cat2 === cat2);
        if (!n2) { n2 = { cat2, children: [] }; n1.children.push(n2); }
        if (cat3 && !n2.children.includes(cat3)) n2.children.push(cat3);
      }
      return copy;
    });
    toast.success("Category added");
    setOpen(false); setCat1(""); setCat2(""); setCat3("");
  };

  const removeLeaf = (c1: string, c2?: string, c3?: string) => {
    setTree((prev) => prev
      .map((n1) => {
        if (n1.cat1 !== c1) return n1;
        if (!c2) return null as any;
        return {
          ...n1,
          children: n1.children
            .map((n2) => {
              if (n2.cat2 !== c2) return n2;
              if (!c3) return null as any;
              return { ...n2, children: n2.children.filter((x) => x !== c3) };
            })
            .filter(Boolean) as any,
        };
      })
      .filter(Boolean) as Tree);
    toast.success("Category removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">Organize products into a three-level hierarchy.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Category</Button>
      </div>

      <Card className="border-border p-6">
        <div className="space-y-1">
          {tree.map((n1) => (
            <div key={n1.cat1}>
              <Row depth={0} icon={<FolderTree className="h-4 w-4" />} label={n1.cat1} onDelete={() => removeLeaf(n1.cat1)} />
              {n1.children.map((n2) => (
                <div key={n2.cat2}>
                  <Row depth={1} icon={<ChevronRight className="h-4 w-4" />} label={n2.cat2} onDelete={() => removeLeaf(n1.cat1, n2.cat2)} />
                  {n2.children.map((leaf) => (
                    <Row key={leaf} depth={2} icon={<ChevronRight className="h-4 w-4" />} label={leaf} onDelete={() => removeLeaf(n1.cat1, n2.cat2, leaf)} />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add category</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Category Level 1</Label><Input value={cat1} onChange={(e) => setCat1(e.target.value)} placeholder="e.g. Electronics" /></div>
            <div className="space-y-2"><Label>Category Level 2 (optional)</Label><Input value={cat2} onChange={(e) => setCat2(e.target.value)} placeholder="e.g. Computers" /></div>
            <div className="space-y-2"><Label>Category Level 3 (optional)</Label><Input value={cat3} onChange={(e) => setCat3(e.target.value)} placeholder="e.g. Laptops" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={add}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ depth, icon, label, onDelete }: { depth: number; icon: React.ReactNode; label: string; onDelete: () => void }) {
  return (
    <div
      className="group flex items-center justify-between rounded-md px-2 py-2 hover:bg-accent"
      style={{ paddingLeft: 8 + depth * 24 }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="truncate text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    </div>
  );
}

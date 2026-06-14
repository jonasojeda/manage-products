import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Plus, Search, Upload, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { products, brands } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/products/")({
  head: () => ({ meta: [{ title: "Products — Prodly" }] }),
  component: ProductsList,
});

const PAGE_SIZE = 8;

function ProductsList() {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (q && !`${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (brand !== "all" && p.brand !== brand) return false;
      if (status !== "all" && p.status !== status) return false;
      return true;
    });
  }, [q, brand, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your catalog of {products.length} products.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/products/import"><Upload className="mr-2 h-4 w-4" />Import CSV</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/products/new"><Plus className="mr-2 h-4 w-4" />New Product</Link>
          </Button>
        </div>
      </div>

      <Card className="border-border">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search SKU or name…" className="pl-9" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          <Select value={brand} onValueChange={(v) => { setBrand(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Brand" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brands</SelectItem>
              {brands.map((b) => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" aria-label="More filters"><SlidersHorizontal className="h-4 w-4" /></Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Cat 1</TableHead>
                <TableHead>Cat 2</TableHead>
                <TableHead>Cat 3</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.brand}</TableCell>
                  <TableCell className="text-muted-foreground">{p.cat1}</TableCell>
                  <TableCell className="text-muted-foreground">{p.cat2}</TableCell>
                  <TableCell className="text-muted-foreground">{p.cat3}</TableCell>
                  <TableCell className="text-right tabular-nums">${p.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "active" ? "default" : p.status === "draft" ? "secondary" : "outline"} className="capitalize">
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.createdAt}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">No products match your filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between border-t border-border p-4 text-sm text-muted-foreground">
          <div>Showing {rows.length} of {filtered.length} products</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span>Page {page} of {pages}</span>
            <Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

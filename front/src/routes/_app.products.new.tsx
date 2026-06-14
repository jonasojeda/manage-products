import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { brands, categories } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/products/new")({
  head: () => ({ meta: [{ title: "New Product — Prodly" }] }),
  component: NewProduct,
});

function NewProduct() {
  const navigate = useNavigate();
  const [cat1, setCat1] = useState<string>("");
  const [cat2, setCat2] = useState<string>("");

  const cat1Opts = categories;
  const cat2Opts = cat1Opts.find((c) => c.cat1 === cat1)?.children ?? [];
  const cat3Opts = cat2Opts.find((c) => c.cat2 === cat2)?.children ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create product</h1>
        <p className="text-sm text-muted-foreground">Add a new product to your catalog.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Product saved");
          navigate({ to: "/products" });
        }}
      >
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input placeholder="SKU-2001" required />
            </div>
            <div className="space-y-2">
              <Label>Product name</Label>
              <Input placeholder="Aurora Pro Laptop" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Textarea rows={4} placeholder="Short product description…" />
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>
                  {brands.map((b) => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select defaultValue="active">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category Level 1</Label>
              <Select value={cat1} onValueChange={(v) => { setCat1(v); setCat2(""); }}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {cat1Opts.map((c) => <SelectItem key={c.cat1} value={c.cat1}>{c.cat1}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category Level 2</Label>
              <Select value={cat2} onValueChange={setCat2} disabled={!cat1}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {cat2Opts.map((c) => <SelectItem key={c.cat2} value={c.cat2}>{c.cat2}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category Level 3</Label>
              <Select disabled={!cat2}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {cat3Opts.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" step="0.01" placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input type="number" placeholder="0" required />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" asChild><Link to="/products">Cancel</Link></Button>
          <Button type="submit">Save product</Button>
        </div>
      </form>
    </div>
  );
}

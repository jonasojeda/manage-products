import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/products/new")({
  head: () => ({ meta: [{ title: "New Product — Prodly" }] }),
  component: NewProduct,
});

function NewProduct() {
  const navigate = useNavigate();

  // API Data States
  const [brandsList, setBrandsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields States
  const [name, setName] = useState("");
  const [ean, setEan] = useState("");
  const [brandId, setBrandId] = useState("");
  const [status, setStatus] = useState("active");
  const [cat1, setCat1] = useState("");
  const [cat2, setCat2] = useState("");
  const [cat3, setCat3] = useState("");
  const [price, setPrice] = useState("");

  // Fetch Brands and Nested Categories on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsData, categoriesData] = await Promise.all([
          apiRequest("brands"),
          apiRequest("categories")
        ]);
        setBrandsList(brandsData || []);
        setCategoriesList(categoriesData || []);
      } catch (err) {
        console.error("Failed to load form data", err);
        toast.error("Failed to load brands or categories.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cascading Categories Options
  const selectedCat1Obj = categoriesList.find((c) => c.name === cat1);
  const cat2Opts = selectedCat1Obj?.subcategories ?? [];
  
  const selectedCat2Obj = cat2Opts.find((c) => c.name === cat2);
  const cat3Opts = selectedCat2Obj?.sub_subcategories ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCat3Obj = cat3Opts.find((c) => c.name === cat3);

    if (!ean.trim()) {
      toast.error("Barcode / EAN is required.");
      return;
    }
    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Saving product...");

    try {
      const payload = {
        ean: ean.trim(),
        name: name.trim(),
        brand_id: brandId && brandId !== "none" ? parseInt(brandId) : null,
        category_id: selectedCat1Obj ? selectedCat1Obj.id : null,
        subcategory_id: selectedCat2Obj ? selectedCat2Obj.id : null,
        sub_subcategory_id: selectedCat3Obj ? selectedCat3Obj.id : null,
        price: price.trim() === "" ? null : parseFloat(price),
        status: status,
      };

      await apiRequest("products", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Product saved successfully!", { id: toastId });
      navigate({ to: "/products" });
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.errors
        ? Object.values(err.errors).flat().join(" ")
        : err.message || "Failed to save product.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading form data...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create product</h1>
        <p className="text-sm text-muted-foreground">Add a new product to your catalog.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="Auto-generated"
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground mt-1">The SKU will be generated automatically upon creation.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ean">Barcode / EAN <span className="text-destructive font-bold">*</span></Label>
              <Input
                id="ean"
                placeholder="e.g. 7791234567890"
                required
                value={ean}
                onChange={(e) => setEan(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Product name</Label>
              <Input
                id="name"
                placeholder="Aurora Pro Laptop"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Select value={brandId} onValueChange={setBrandId} disabled={saving}>
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / No Brand</SelectItem>
                  {brandsList.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus} disabled={saving}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat1">Category Level 1</Label>
              <Select
                value={cat1}
                onValueChange={(v) => { setCat1(v); setCat2(""); setCat3(""); }}
                disabled={saving}
              >
                <SelectTrigger id="cat1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / No Category</SelectItem>
                  {categoriesList.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat2">Category Level 2</Label>
              <Select
                value={cat2}
                onValueChange={(v) => { setCat2(v); setCat3(""); }}
                disabled={saving || !cat1}
              >
                <SelectTrigger id="cat2">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {cat2Opts.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat3">Category Level 3</Label>
              <Select
                value={cat3}
                onValueChange={setCat3}
                disabled={saving || !cat2}
              >
                <SelectTrigger id="cat3">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {cat3Opts.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (Optional)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={saving}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" asChild disabled={saving}>
            <Link to="/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

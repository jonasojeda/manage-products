import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/products/import")({
  head: () => ({ meta: [{ title: "Import CSV — Prodly" }] }),
  component: ImportCsv,
});

const previewRows = [
  ["SKU-2001", "Vega Wireless Earbuds", "Acme Corp", "Electronics", "Audio", "Headphones", "129.00"],
  ["SKU-2002", "Nova Standing Desk", "Northwind", "Home", "Furniture", "Desks", "499.00"],
  ["SKU-2003", "Lyra Smart Bulb", "Globex", "Home", "Furniture", "Shelves", "19.00"],
  ["SKU-2004", "Orion Mechanical KB", "Initech", "Electronics", "Computers", "Desktops", "159.00"],
  ["SKU-2005", "Pegasus Office Chair", "Hooli", "Home", "Furniture", "Office Chairs", "349.00"],
];

function ImportCsv() {
  const [file, setFile] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import products</h1>
        <p className="text-sm text-muted-foreground">Bulk import products from a CSV file.</p>
      </div>

      <Card className="border-border">
        <CardContent className="p-6">
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault(); setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) { setFile(f.name); setValidated(false); }
            }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
              dragOver ? "border-primary bg-accent" : "border-border hover:bg-accent/50"
            }`}
          >
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f.name); setValidated(false); } }}
            />
            <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
              <UploadCloud className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="mt-4 text-sm font-medium">Drag and drop your CSV file here or click to browse</div>
            <div className="mt-1 text-xs text-muted-foreground">Supported format: CSV · Max 10MB</div>
          </label>

          {file && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{file}</div>
                  <div className="text-xs text-muted-foreground">253 rows detected</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setValidated(false); }}>Remove</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {file && (
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Preview</CardTitle></CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["sku", "name", "brand", "cat1", "cat2", "cat3", "price"].map((h) => (
                      <TableHead key={h} className="font-mono text-xs">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((r, i) => (
                    <TableRow key={i}>{r.map((c, j) => <TableCell key={j} className="text-sm">{c}</TableCell>)}</TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {file && validated && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-border"><CardContent className="p-5"><div className="text-xs text-muted-foreground">Total rows</div><div className="mt-1 text-2xl font-semibold">253</div></CardContent></Card>
          <Card className="border-border"><CardContent className="p-5"><div className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Valid</div><div className="mt-1 text-2xl font-semibold">250</div></CardContent></Card>
          <Card className="border-border"><CardContent className="p-5"><div className="flex items-center gap-2 text-xs text-muted-foreground"><AlertCircle className="h-3.5 w-3.5 text-destructive" />Invalid</div><div className="mt-1 text-2xl font-semibold">3</div></CardContent></Card>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={!file} onClick={() => { setValidated(true); toast.success("File validated"); }}>Validate File</Button>
        <Button disabled={!file || !validated} onClick={() => toast.success("250 products imported")}>Import Products</Button>
      </div>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UploadCloud, FileText, ArrowLeft, Play, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/_app/products/import")({
  head: () => ({ meta: [{ title: "Import CSV/XLS — Prodly" }] }),
  component: ImportCsv,
});

// The target attributes we need for importing
interface ImportField {
  key: string;
  label: string;
  required: boolean;
  patterns: string[];
}

const IMPORT_FIELDS: ImportField[] = [
  { key: "ean", label: "Barcode / EAN", required: true, patterns: ["ean", "barcode", "bar code", "bar_code", "codigo de barra", "codigo de barras", "ean13", "upc"] },
  { key: "name", label: "Product Name", required: true, patterns: ["producto", "nombre", "name", "product name", "product"] },
  { key: "brand", label: "Brand", required: false, patterns: ["brand", "marca", "manufacturer", "brand name"] },
  { key: "cat1", label: "Category Level 1", required: false, patterns: ["cat1", "categoria", "category", "category 1"] },
  { key: "cat2", label: "Category Level 2", required: false, patterns: ["cat2", "subcategoria", "subcategory", "category 2"] },
  { key: "cat3", label: "Category Level 3", required: false, patterns: ["cat3", "subsubcategoria", "sub-subcategory", "category 3"] },
  { key: "price", label: "Price", required: false, patterns: ["price", "precio", "cost", "costo", "price value"] },
];

function ImportCsv() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [skipExisting, setSkipExisting] = useState(false);
  const [allJsonRows, setAllJsonRows] = useState<any[][]>([]);
  const [headerRow, setHeaderRow] = useState<number>(1);
  const [dataStartRow, setDataStartRow] = useState<number>(2);
  const [importStatus, setImportStatus] = useState<{
    total: number;
    current: number;
    imported: number;
    updated: number;
    skipped: number;
    message: string;
  } | null>(null);

  const applyRowConfiguration = (jsonRows: any[][], hRow: number, dStartRow: number) => {
    if (jsonRows.length === 0) return;

    const hIndex = Math.max(0, hRow - 1);
    const dIndex = Math.max(0, dStartRow - 1);

    const fileHeaders = (jsonRows[hIndex] || []).map((h: any) => String(h || "").trim()).filter(Boolean);
    const dataRows = jsonRows.slice(dIndex).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ""));

    setHeaders(fileHeaders);
    setRawRows(dataRows);

    const updatedMapping: Record<string, string> = {};
    IMPORT_FIELDS.forEach(field => {
      const matchedHeader = fileHeaders.find(h => {
        const hLower = h.toLowerCase();
        return field.patterns.some(p => hLower.includes(p) || p.includes(hLower));
      });
      if (matchedHeader) {
        updatedMapping[field.key] = matchedHeader;
      } else {
        updatedMapping[field.key] = "";
      }
    });
    setMapping(updatedMapping);
  };

  const handleHeaderRowChange = (val: number) => {
    const maxRows = allJsonRows.length;
    let newHeaderRow = Math.max(1, val);
    if (newHeaderRow > maxRows) {
      newHeaderRow = maxRows;
    }
    setHeaderRow(newHeaderRow);
    
    let newDataStartRow = dataStartRow;
    if (dataStartRow <= newHeaderRow) {
      newDataStartRow = Math.min(maxRows, newHeaderRow + 1);
      setDataStartRow(newDataStartRow);
    }
    
    applyRowConfiguration(allJsonRows, newHeaderRow, newDataStartRow);
  };

  const handleDataStartRowChange = (val: number) => {
    const maxRows = allJsonRows.length;
    let newDataStartRow = Math.max(headerRow + 1, val);
    if (newDataStartRow > maxRows + 1) {
      newDataStartRow = maxRows + 1;
    }
    setDataStartRow(newDataStartRow);
    applyRowConfiguration(allJsonRows, headerRow, newDataStartRow);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonRows.length === 0) {
          toast.error("The file is empty.");
          return;
        }

        setFile(selectedFile);
        setAllJsonRows(jsonRows);
        setHeaderRow(1);
        setDataStartRow(2);
        applyRowConfiguration(jsonRows, 1, 2);
        toast.success(`Loaded file: ${selectedFile.name} (${jsonRows.length} total rows)`);
      } catch (error) {
        console.error("Failed to parse file", error);
        toast.error("Failed to parse the file. Please ensure it's a valid CSV or XLS/XLSX file.");
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleMappingChange = (fieldKey: string, headerValue: string) => {
    setMapping(prev => ({
      ...prev,
      [fieldKey]: headerValue
    }));
  };

  // Convert raw row to mapped object based on current dropdown selections
  const getMappedRow = (row: any[]) => {
    const obj: Record<string, any> = {};
    IMPORT_FIELDS.forEach(field => {
      const mappedHeader = mapping[field.key];
      if (mappedHeader) {
        const headerIndex = headers.indexOf(mappedHeader);
        if (headerIndex !== -1) {
          obj[field.key] = row[headerIndex];
        }
      }
    });
    return obj;
  };

  const isMappingValid = () => {
    return IMPORT_FIELDS.filter(f => f.required).every(f => !!mapping[f.key]);
  };

  const handleImport = async () => {
    if (!isMappingValid()) {
      toast.error("Please complete all required field mappings.");
      return;
    }

    setImporting(true);

    // Build final products array payload
    const allProducts = rawRows.map(row => {
      const mapped = getMappedRow(row);
      return {
        ean: mapped.ean ? String(mapped.ean).trim() : null,
        name: mapped.name ? String(mapped.name).trim() : "",
        brand: mapped.brand ? String(mapped.brand).trim() : "",
        category: mapped.cat1 ? String(mapped.cat1).trim() : "",
        subcategory: mapped.cat2 ? String(mapped.cat2).trim() : "",
        sub_subcategory: mapped.cat3 ? String(mapped.cat3).trim() : "",
        price: mapped.price && !isNaN(parseFloat(mapped.price)) ? parseFloat(mapped.price) : null,
      };
    }).filter(p => p.ean && p.name);

    const total = allProducts.length;
    if (total === 0) {
      toast.error("No valid products to import. Please check your mapping and file rows.");
      setImporting(false);
      return;
    }

    setImportStatus({
      total,
      current: 0,
      imported: 0,
      updated: 0,
      skipped: 0,
      message: "Preparing import payload..."
    });

    const BATCH_SIZE = 2000;
    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = allProducts.slice(i, i + BATCH_SIZE);
      const currentProgress = i + batch.length;
      
      setImportStatus(prev => prev ? {
        ...prev,
        current: i,
        message: `Sending products ${i + 1} to ${currentProgress} of ${total}...`
      } : null);

      try {
        const response = await apiRequest("products/import", {
          method: "POST",
          body: JSON.stringify({
            products: batch,
            skip_existing: skipExisting
          }),
        });

        importedCount += response.imported || 0;
        updatedCount += response.updated || 0;
        skippedCount += response.skipped || 0;

        setImportStatus({
          total,
          current: currentProgress,
          imported: importedCount,
          updated: updatedCount,
          skipped: skippedCount,
          message: `Processed ${currentProgress} of ${total} products...`
        });
      } catch (err: any) {
        console.error("Batch import failed", err);
        const errorMsg = err.errors
          ? Object.values(err.errors).flat().join(" ")
          : err.message || "Failed to import batch.";
        
        toast.error(`Error in batch starting at row ${i + 1}: ${errorMsg}`);
        setImporting(false);
        return;
      }
    }

    toast.success(`Import completed successfully! Created: ${importedCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`, { duration: 7000 });
    setImporting(false);
    
    setTimeout(() => {
      navigate({ to: "/products" });
    }, 2000);
  };

  const handleReset = () => {
    setFile(null);
    setHeaders([]);
    setRawRows([]);
    setMapping({});
    setSkipExisting(false);
    setAllJsonRows([]);
    setHeaderRow(1);
    setDataStartRow(2);
    setImportStatus(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild disabled={importing}>
          <Link to="/products"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Import products</h1>
          <p className="text-sm text-muted-foreground">Upload a CSV, XLS, or XLSX file, map its columns, and import products.</p>
        </div>
      </div>

      {!file ? (
        <Card className="border-border">
          <CardContent className="p-6">
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault(); setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) { processFile(f); }
              }}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-16 text-center transition-colors ${
                dragOver ? "border-primary bg-accent/60" : "border-border hover:bg-accent/40"
              }`}
            >
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="grid h-14 w-14 place-items-center rounded-full bg-muted text-primary">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div className="mt-4 text-base font-semibold">Drag and drop your spreadsheet here or click to browse</div>
              <div className="mt-2 text-xs text-muted-foreground">Supported formats: CSV, XLS, XLSX · Max 10MB</div>
            </label>
          </CardContent>
        </Card>
      ) : importing && importStatus ? (
        <div className="max-w-md mx-auto py-12">
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-base flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Importing Products</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {importStatus.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.round((importStatus.current / importStatus.total) * 100)}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 text-center">
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">Progress</div>
                  <div className="mt-1 text-lg font-semibold">
                    {Math.round((importStatus.current / importStatus.total) * 100)}%
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    ({importStatus.current} / {importStatus.total})
                  </div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">Created</div>
                  <div className="mt-1 text-lg font-semibold text-emerald-600">
                    {importStatus.imported}
                  </div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">Updated</div>
                  <div className="mt-1 text-lg font-semibold text-blue-600">
                    {importStatus.updated}
                  </div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">Skipped</div>
                  <div className="mt-1 text-lg font-semibold text-amber-600">
                    {importStatus.skipped}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Column Mapping Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">File Details</CardTitle>
                <CardDescription className="text-xs">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm rounded border border-border p-2 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Total Rows</span>
                  </div>
                  <span className="font-semibold">{rawRows.length}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset} className="w-full">
                  Change File
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Import Options</CardTitle>
                <CardDescription className="text-xs">
                  Configure behavior for the import process.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 rounded-lg border border-border p-3 bg-muted/20">
                  <Checkbox
                    id="skip-existing"
                    checked={skipExisting}
                    onCheckedChange={(checked) => setSkipExisting(!!checked)}
                    disabled={importing}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="skip-existing"
                      className="text-xs font-semibold select-none cursor-pointer leading-normal text-foreground"
                    >
                      Omitir productos existentes
                    </label>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Si se activa, se omitirán los productos con EAN ya registrados, reduciendo drásticamente el tiempo de carga. Si se desactiva, se actualizarán los datos de los productos existentes.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Fila de cabecera
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={allJsonRows.length || 1}
                      value={headerRow}
                      onChange={(e) => handleHeaderRowChange(parseInt(e.target.value) || 1)}
                      disabled={importing || allJsonRows.length === 0}
                      className="h-8 text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Fila con los nombres de las columnas.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Fila inicio de datos
                    </label>
                    <Input
                      type="number"
                      min={headerRow + 1}
                      max={allJsonRows.length + 1 || 2}
                      value={dataStartRow}
                      onChange={(e) => handleDataStartRowChange(parseInt(e.target.value) || (headerRow + 1))}
                      disabled={importing || allJsonRows.length === 0}
                      className="h-8 text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Fila donde empiezan los productos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span>Column Mapping</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Map target product fields to your sheet's columns.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {IMPORT_FIELDS.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-xs font-semibold flex items-center justify-between">
                      <span>
                        {field.label} {field.required && <span className="text-destructive font-bold">*</span>}
                      </span>
                      {!mapping[field.key] && field.required && (
                        <span className="text-[10px] text-destructive flex items-center gap-1 font-normal">
                          <AlertCircle className="h-3 w-3" /> Unmapped
                        </span>
                      )}
                      {mapping[field.key] && (
                        <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-normal">
                          <CheckCircle2 className="h-3 w-3" /> Mapped
                        </span>
                      )}
                    </label>
                    <Select
                      value={mapping[field.key] || "none"}
                      onValueChange={(val) => handleMappingChange(field.key, val === "none" ? "" : val)}
                    >
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="Choose column..." />
                      </SelectTrigger>
                      <SelectContent>
                        {!field.required && <SelectItem value="none">-- Skip attribute --</SelectItem>}
                        {headers.map((h) => (
                          <SelectItem key={h} value={h} className="text-xs">
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Data Preview Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Data Preview</CardTitle>
                  <CardDescription className="text-xs">
                    Preview of the first 5 rows with your current column mappings.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {IMPORT_FIELDS.map((f) => (
                        <TableHead key={f.key} className="text-xs font-semibold">
                          {f.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawRows.slice(0, 5).map((row, rowIndex) => {
                      const mapped = getMappedRow(row);
                      return (
                        <TableRow key={rowIndex}>
                          {IMPORT_FIELDS.map((f) => {
                            const val = mapped[f.key];
                            return (
                              <TableCell key={f.key} className="text-xs truncate max-w-[120px]">
                                {val !== undefined && val !== null ? String(val) : (
                                  <span className="text-muted-foreground italic">empty</span>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild disabled={importing}>
                <Link to="/products">Cancel</Link>
              </Button>
              <Button
                disabled={!isMappingValid() || importing}
                onClick={handleImport}
                className="min-w-[140px]"
              >
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Import Products
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

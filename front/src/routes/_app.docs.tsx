import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  BookOpen, 
  KeyRound, 
  Copy, 
  Check, 
  Play, 
  Code, 
  Terminal, 
  Info, 
  ArrowRight, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCode2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

interface Token {
  id: number;
  name: string;
  token: string;
  status: string;
}

interface ProductInfo {
  id: number;
  ean: string;
  name: string;
  sku: string;
  price: string;
  status: string;
}

export const Route = createFileRoute("/_app/docs")({
  head: () => ({ meta: [{ title: "Documentación API — Prodly" }] }),
  component: DocsPage,
});

function DocsPage() {
  const [tokenInput, setTokenInput] = useState("");
  const [eanInput, setEanInput] = useState("");
  
  // Test sandbox execution state
  const [testResult, setTestResult] = useState<any>(null);
  const [testStatus, setTestStatus] = useState<number | null>(null);
  const [testStatusText, setTestStatusText] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testHeaders, setTestHeaders] = useState<Record<string, string>>({});

  // Helper data fetched on mount
  const [tokens, setTokens] = useState<Token[]>([]);
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [loadingHelpers, setLoadingHelpers] = useState(true);

  // Clipboard copy state
  const [copiedLang, setCopiedLang] = useState<string | null>(null);

  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        setLoadingHelpers(true);
        // Fetch existing tokens (for names reference)
        const tokensData = await apiRequest("api-tokens");
        setTokens(tokensData || []);

        // Fetch products to suggest EAN codes
        const productsData = await apiRequest("products?per_page=6");
        if (productsData && productsData.data) {
          setProducts(productsData.data);
          // Set first product EAN as default if available
          if (productsData.data.length > 0) {
            setEanInput(productsData.data[0].ean);
          }
        }
      } catch (err) {
        console.error("Failed to fetch helper reference data", err);
      } finally {
        setLoadingHelpers(false);
      }
    };

    fetchHelpers();
  }, []);

  const runTest = async () => {
    if (!eanInput.trim()) {
      toast.error("Por favor, ingrese un código EAN.");
      return;
    }
    if (!tokenInput.trim()) {
      toast.error("Por favor, ingrese su token de API.");
      return;
    }

    setTestLoading(true);
    setTestResult(null);
    setTestStatus(null);
    setTestStatusText("");
    setTestHeaders({});

    try {
      const BASE_URL = (import.meta.env?.VITE_API_URL as string) || "http://localhost:8000/api";
      const url = `${BASE_URL}/external/products/${encodeURIComponent(eanInput.trim())}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${tokenInput.trim()}`
        }
      });

      setTestStatus(response.status);
      setTestStatusText(response.statusText || getStatusText(response.status));

      // Extract some interesting headers
      const headersObj: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        if (["content-type", "cache-control", "x-ratelimit-remaining"].includes(key.toLowerCase())) {
          headersObj[key] = value;
        }
      });
      setTestHeaders(headersObj);

      const data = await response.json();
      setTestResult(data);
      
      if (response.ok) {
        toast.success("Consulta completada exitosamente");
      } else {
        toast.error(`Error de API: ${response.status} - ${data.message || 'Error desconocido'}`);
      }
    } catch (err: any) {
      console.error(err);
      setTestStatus(500);
      setTestStatusText("Fetch Error");
      setTestResult({
        error: "Network Error",
        message: err.message || "No se pudo conectar con el servidor de la API externa."
      });
      toast.error("Error al conectar con la API.");
    } finally {
      setTestLoading(false);
    }
  };

  const getStatusText = (status: number) => {
    const texts: Record<number, string> = {
      200: "OK",
      401: "Unauthorized",
      404: "Not Found",
      422: "Unprocessable Content",
      500: "Internal Server Error"
    };
    return texts[status] || "Unknown";
  };

  const copyCode = (code: string, lang: string) => {
    navigator.clipboard.writeText(code);
    setCopiedLang(lang);
    toast.success("Código copiado al portapapeles");
    setTimeout(() => setCopiedLang(null), 2000);
  };

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8000";
  const apiEndpointUrl = `${currentOrigin}/api/external/products/{ean}`;

  // Code snippet definitions
  const curlCode = `curl -X GET "${currentOrigin}/api/external/products/${eanInput || '7791234567890'}" \\
  -H "Authorization: Bearer ${tokenInput || '<SU_API_TOKEN>'}" \\
  -H "Accept: application/json"`;

  const jsCode = `const ean = "${eanInput || '7791234567890'}";
const token = "${tokenInput || '<SU_API_TOKEN>'}";

fetch(\`${currentOrigin}/api/external/products/\${ean}\`, {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Authorization': \`Bearer \${token}\`
  }
})
.then(response => {
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
  return response.json();
})
.then(product => console.log('Producto encontrado:', product))
.catch(error => console.error('Error de consulta:', error));`;

  const phpCode = `<?php

$ean = "${eanInput || '7791234567890'}";
$token = "${tokenInput || '<SU_API_TOKEN>'}";
$url = "${currentOrigin}/api/external/products/" . urlencode($ean);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Accept: application/json",
    "Authorization: Bearer " . $token
]);

$response = curl_exec($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($statusCode === 200) {
    $product = json_decode($response, true);
    print_r($product);
} else {
    echo "Error " . $statusCode . ": " . $response;
}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Referencia de API</h1>
        <p className="text-sm text-muted-foreground">
          Documentación para la integración externa y consulta de productos mediante código EAN.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: API documentation */}
        <div className="space-y-6 lg:col-span-7">
          {/* Endpoint Specification Card */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-primary mb-1">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Especificación</span>
              </div>
              <CardTitle className="text-xl">Consultar Producto por EAN</CardTitle>
              <CardDescription>
                Obtén los detalles completos de un producto específico utilizando su código de barras (EAN) único.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Endpoint Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 font-mono text-sm">
                <span className="inline-flex w-fit items-center rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  GET
                </span>
                <span className="text-foreground break-all select-all">{apiEndpointUrl}</span>
              </div>

              {/* URL Parameters */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Parámetros de Ruta (URL Path)</h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-muted-foreground">
                        <th className="p-3 font-medium">Parámetro</th>
                        <th className="p-3 font-medium">Tipo</th>
                        <th className="p-3 font-medium">Requerido</th>
                        <th className="p-3 font-medium">Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="p-3 font-mono font-semibold text-primary">ean</td>
                        <td className="p-3 text-muted-foreground font-mono text-xs">string</td>
                        <td className="p-3 text-red-500 font-medium">Sí</td>
                        <td className="p-3 text-muted-foreground">El código de barras / EAN del producto a buscar.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Authentication Guide */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Autenticación y Cabeceras</h4>
                <div className="rounded-lg border border-border p-4 bg-muted/10 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Las peticiones externas deben incluir las siguientes cabeceras HTTP. Puedes generar y revocar tokens directamente en la sección de
                    {" "}<Link to="/tokens" className="text-primary font-medium underline hover:text-primary/80">API Tokens</Link>.
                  </p>
                  <div className="grid gap-2 text-xs font-mono bg-muted/60 p-3 rounded border border-border">
                    <div><span className="text-muted-foreground">Authorization:</span> <span className="text-foreground">Bearer &lt;SU_TOKEN_DE_API&gt;</span></div>
                    <div><span className="text-muted-foreground">Accept:</span> <span className="text-foreground">application/json</span></div>
                  </div>
                </div>
              </div>

              {/* Response format explanation */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Respuesta (Response)</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Si el producto es encontrado, el servidor devolverá una respuesta HTTP <strong>200 OK</strong> conteniendo el objeto JSON del producto, el cual incluye las relaciones eager-loaded:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 p-2 rounded">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>brand (Marca)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 p-2 rounded">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>category (Nivel 1)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 p-2 rounded">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>subcategory (Nivel 2)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 p-2 rounded">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>sub_subcategory (Nivel 3)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Snippets Card */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Code className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Ejemplos de Integración</span>
              </div>
              <CardTitle className="text-lg">Código de Muestra</CardTitle>
              <CardDescription>
                Copia estos ejemplos listos para producción para integrar la consulta en tu backend o aplicación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="curl" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="curl" className="text-xs">
                    <Terminal className="h-3.5 w-3.5 mr-1.5" /> cURL
                  </TabsTrigger>
                  <TabsTrigger value="javascript" className="text-xs">
                    <FileCode2 className="h-3.5 w-3.5 mr-1.5" /> JavaScript
                  </TabsTrigger>
                  <TabsTrigger value="php" className="text-xs">
                    <Code className="h-3.5 w-3.5 mr-1.5" /> PHP
                  </TabsTrigger>
                </TabsList>

                {/* cURL */}
                <TabsContent value="curl" className="space-y-2">
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                      {curlCode}
                    </pre>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute right-2 top-2 h-7 w-7 text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                      onClick={() => copyCode(curlCode, "curl")}
                    >
                      {copiedLang === "curl" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </TabsContent>

                {/* JavaScript */}
                <TabsContent value="javascript" className="space-y-2">
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                      {jsCode}
                    </pre>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute right-2 top-2 h-7 w-7 text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                      onClick={() => copyCode(jsCode, "js")}
                    >
                      {copiedLang === "js" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </TabsContent>

                {/* PHP */}
                <TabsContent value="php" className="space-y-2">
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                      {phpCode}
                    </pre>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute right-2 top-2 h-7 w-7 text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                      onClick={() => copyCode(phpCode, "php")}
                    >
                      {copiedLang === "php" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive Sandbox */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="border-border shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary mb-1">
                <Play className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Consola Sandbox</span>
              </div>
              <CardTitle className="text-xl">Probar API en Vivo</CardTitle>
              <CardDescription>
                Realiza consultas directas utilizando tus credenciales reales y visualiza las respuestas en tiempo real.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Token Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sandbox-token" className="text-xs font-semibold">
                    Token de API (Bearer Token)
                  </Label>
                  <Link 
                    to="/tokens" 
                    className="text-xs text-primary underline flex items-center gap-1 hover:text-primary/80"
                  >
                    Generar Token <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="sandbox-token"
                    type="password"
                    value={tokenInput} 
                    onChange={(e) => setTokenInput(e.target.value)} 
                    placeholder="np_pat_..." 
                    className="pl-9 font-mono text-xs border-border"
                  />
                </div>

                {/* Suggest created tokens if any */}
                {!loadingHelpers && tokens.length > 0 && (
                  <div className="text-[11px] text-muted-foreground mt-1.5 space-y-1">
                    <span className="font-medium text-foreground">Tus tokens activos: </span>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {tokens.map(t => (
                        <span 
                          key={t.id} 
                          className="bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono cursor-pointer hover:bg-muted/80 hover:text-foreground transition-colors"
                          onClick={() => {
                            toast.info(`Ingresa el valor del token "${t.name}" que guardaste al crearlo.`);
                          }}
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* EAN Input */}
              <div className="space-y-2">
                <Label htmlFor="sandbox-ean" className="text-xs font-semibold">
                  Código EAN del Producto
                </Label>
                <Input 
                  id="sandbox-ean"
                  value={eanInput} 
                  onChange={(e) => setEanInput(e.target.value)} 
                  placeholder="ej. 7791234567890" 
                  className="font-mono text-xs border-border"
                />

                {/* Suggest product EANs */}
                {!loadingHelpers && products.length > 0 ? (
                  <div className="text-[11px] text-muted-foreground mt-1.5">
                    <span className="font-medium text-foreground">Sugerencias rápidas (haga clic para usar):</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {products.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          className="bg-primary/5 border border-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-mono hover:bg-primary/15 hover:border-primary/20 transition-all text-left truncate max-w-full"
                          onClick={() => setEanInput(p.ean)}
                          title={`${p.name} (${p.ean})`}
                        >
                          {p.ean} - {p.name.slice(0, 15)}...
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  loadingHelpers && <div className="text-[10px] text-muted-foreground">Cargando sugerencias de EAN...</div>
                )}
              </div>

              {/* Action Button */}
              <Button 
                onClick={runTest} 
                disabled={testLoading}
                className="w-full mt-2"
              >
                {testLoading ? "Ejecutando Consulta..." : "Ejecutar Consulta de Prueba"}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>

              {/* Sandbox Results Display */}
              {(testStatus !== null || testResult) && (
                <div className="space-y-3 pt-4 border-t border-border mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Resultado del Test:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">Status:</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-mono font-bold ${
                          testStatus === 200 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                            : testStatus === 404 
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-red-500/10 text-red-600 border-red-500/20"
                        }`}
                      >
                        {testStatus} {testStatusText}
                      </Badge>
                    </div>
                  </div>

                  {/* Header metadata */}
                  {Object.keys(testHeaders).length > 0 && (
                    <div className="text-[10px] font-mono bg-muted/30 p-2 rounded border border-border/60 text-muted-foreground space-y-0.5">
                      {Object.entries(testHeaders).map(([k, v]) => (
                        <div key={k}><span className="text-foreground">{k}:</span> {v}</div>
                      ))}
                    </div>
                  )}

                  {/* Body output */}
                  <div className="relative">
                    <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 max-h-[300px]">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute right-2 top-2 h-6 w-6 text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(testResult, null, 2))}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Instructions if sandbox has not been executed */}
              {testStatus === null && !testLoading && (
                <div className="rounded-lg border border-border border-dashed p-6 text-center mt-2 bg-muted/5">
                  <HelpCircle className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
                  <h5 className="text-xs font-semibold text-foreground">Sandbox Listo</h5>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    Ingrese su token personal y un EAN válido de producto para realizar una llamada real a la API y verificar la respuesta JSON.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

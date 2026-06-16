import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Copy, Trash2, KeyRound, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

export interface Token {
  id: number;
  name: string;
  token: string;
  status: string;
  createdAt: string;
  lastUsed: string;
}

export const Route = createFileRoute("/_app/tokens")({
  head: () => ({ meta: [{ title: "API Tokens — Prodly" }] }),
  component: TokensPage,
});

function TokensPage() {
  const [list, setList] = useState<Token[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [revealed, setRevealed] = useState<Token | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("api-tokens");
      setList(data || []);
    } catch (err) {
      console.error("Failed to load tokens", err);
      toast.error("Failed to load tokens.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const save = async () => {
    if (!name.trim()) return;
    try {
      const data = await apiRequest("api-tokens", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setList((l) => [data, ...l]);
      setOpen(false);
      setRevealed(data);
      setName("");
    } catch (err) {
      console.error("Failed to create token", err);
      toast.error("Failed to create token.");
    }
  };

  const revoke = async (id: number) => {
    try {
      await apiRequest(`api-tokens/${id}`, {
        method: "DELETE",
      });
      setList((l) => l.filter((t) => t.id !== id));
      toast.success("Token revoked");
    } catch (err) {
      console.error("Failed to revoke token", err);
      toast.error("Failed to revoke token.");
    }
  };

  const copy = async (v: string) => {
    try { await navigator.clipboard.writeText(v); toast.success("Token copied"); } catch { toast.error("Copy failed"); }
  };

  const handleRegenerate = async (id: number) => {
    try {
      const data = await apiRequest(`api-tokens/${id}/regenerate`, {
        method: "POST",
      });
      setList((l) => l.map((t) => (t.id === id ? data : t)));
      setRevealed(data);
      toast.success("Token regenerated successfully");
    } catch (err) {
      console.error("Failed to regenerate token", err);
      toast.error("Failed to regenerate token.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">API Tokens</h1>
          <p className="text-sm text-muted-foreground">Manage tokens for the Product Microservice API.</p>
        </div>
        <Button size="sm" onClick={() => { setOpen(true); setName(""); }}>
          <Plus className="mr-2 h-4 w-4" />Create Token
        </Button>
      </div>

      <Card className="border-border">
        <div className="overflow-x-auto relative min-h-[150px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-muted-foreground" />{t.name}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{t.token}</TableCell>
                  <TableCell>
                    <Badge variant={t.status === "active" ? "default" : "outline"} className="capitalize">{t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t.createdAt}</TableCell>
                  <TableCell className="text-muted-foreground">{t.lastUsed}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={t.status === "revoked"}
                        onClick={() => handleRegenerate(t.id)}
                        title="Volver a generar token"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled={t.status === "revoked"} onClick={() => revoke(t.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No active API tokens found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API token</DialogTitle>
            <DialogDescription>Tokens authenticate requests to the Product Microservice API.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Production Server" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!name.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!revealed} onOpenChange={(o) => !o && setRevealed(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Token created</DialogTitle>
            <DialogDescription>Copy your token now — you won't be able to see it again.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span className="text-muted-foreground">
                Store this token securely. It will be used to access the Product Microservice API.
              </span>
            </div>
            <div className="flex gap-2">
              <Input readOnly value={revealed?.token ?? ""} className="font-mono text-xs" />
              <Button variant="outline" onClick={() => revealed && copy(revealed.token)}><Copy className="h-4 w-4" /></Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setRevealed(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Copy, Trash2, KeyRound, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { tokens as seed, generateToken, maskToken, type Token } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/tokens")({
  head: () => ({ meta: [{ title: "API Tokens — Prodly" }] }),
  component: TokensPage,
});

function TokensPage() {
  const [list, setList] = useState<Token[]>(seed);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [revealed, setRevealed] = useState<Token | null>(null);

  const generate = () => setToken(generateToken());

  const save = () => {
    if (!name.trim() || !token) return;
    const t: Token = {
      id: `t_${Date.now()}`,
      name, token, status: "active",
      createdAt: new Date().toISOString().slice(0, 10),
      lastUsed: "—",
    };
    setList((l) => [t, ...l]);
    setOpen(false);
    setRevealed(t);
    setName(""); setToken("");
  };

  const revoke = (id: string) => {
    setList((l) => l.map((t) => (t.id === id ? { ...t, status: "revoked" } : t)));
    toast.success("Token revoked");
  };

  const copy = async (v: string) => {
    try { await navigator.clipboard.writeText(v); toast.success("Token copied"); } catch { toast.error("Copy failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">API Tokens</h1>
          <p className="text-sm text-muted-foreground">Manage tokens for the Product Microservice API.</p>
        </div>
        <Button size="sm" onClick={() => { setOpen(true); setName(""); setToken(""); }}>
          <Plus className="mr-2 h-4 w-4" />Create Token
        </Button>
      </div>

      <Card className="border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-muted-foreground" />{t.name}</div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{maskToken(t.token)}</TableCell>
                <TableCell>
                  <Badge variant={t.status === "active" ? "default" : "outline"} className="capitalize">{t.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{t.createdAt}</TableCell>
                <TableCell className="text-muted-foreground">{t.lastUsed}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => copy(t.token)}><Copy className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" disabled={t.status === "revoked"} onClick={() => revoke(t.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
            <div className="space-y-2">
              <Label>Token</Label>
              <div className="flex gap-2">
                <Input value={token} readOnly placeholder="Click Generate to create a token" className="font-mono text-xs" />
                <Button type="button" variant="outline" onClick={generate}>Generate</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!name || !token}>Save</Button>
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

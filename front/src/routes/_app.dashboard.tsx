import { createFileRoute } from "@tanstack/react-router";
import { Package, Tag, FolderTree, KeyRound, TrendingUp, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { activity, products, brands, tokens } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Prodly" }] }),
  component: Dashboard,
});

const stats = [
  { label: "Total Products", value: products.length, delta: "+12.4%", icon: Package },
  { label: "Total Brands", value: brands.length, delta: "+2", icon: Tag },
  { label: "Total Categories", value: 18, delta: "+3", icon: FolderTree },
  { label: "Active API Tokens", value: tokens.filter((t) => t.status === "active").length, delta: "stable", icon: KeyRound },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your product microservice.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight">{s.value}</div>
                </div>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>{s.delta} this month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Badge variant="secondary" className="font-normal">Live</Badge>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activity.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-muted-foreground">{a.date}</TableCell>
                    <TableCell className="font-medium">{a.action}</TableCell>
                    <TableCell className="text-muted-foreground">{a.user}</TableCell>
                    <TableCell className="text-muted-foreground">{a.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Last Import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground">Imported on</div>
              <div className="text-sm font-medium">June 14, 2026 · 09:10</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs text-muted-foreground">Imported</div>
                <div className="mt-1 text-xl font-semibold">248</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs text-muted-foreground">Failed</div>
                <div className="mt-1 text-xl font-semibold text-destructive">3</div>
              </div>
            </div>
            <a href="#" className="inline-flex items-center gap-1 text-sm text-foreground hover:underline">
              View report <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

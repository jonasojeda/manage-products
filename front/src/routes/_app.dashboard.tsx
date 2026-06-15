import { createFileRoute } from "@tanstack/react-router";
import { Package, Tag, FolderTree, KeyRound, TrendingUp, ArrowUpRight, FolderOpen, Layers, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { activity } from "@/lib/mock-data";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Prodly" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await apiRequest("dashboard/stats");
        setData(res);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load dashboard stats", err);
        setError(err.message || "Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Products",
      value: data ? data.products_count : 0,
      delta: "+12.4%",
      icon: Package,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    },
    {
      label: "Total Brands",
      value: data ? data.brands_count : 0,
      delta: "+2",
      icon: Tag,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
    },
    {
      label: "Categories Lvl 1",
      value: data ? data.categories_count : 0,
      delta: "+3",
      icon: FolderTree,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20",
    },
    {
      label: "Subcategories Lvl 2",
      value: data ? data.subcategories_count : 0,
      delta: "+4",
      icon: FolderOpen,
      iconColor: "text-teal-500",
      bgColor: "bg-teal-500/10 hover:bg-teal-500/20",
    },
    {
      label: "Sub-subcategories Lvl 3",
      value: data ? data.sub_subcategories_count : 0,
      delta: "+5",
      icon: Layers,
      iconColor: "text-cyan-500",
      bgColor: "bg-cyan-500/10 hover:bg-cyan-500/20",
    },
    {
      label: "Active API Tokens",
      value: data ? data.tokens_count : 0,
      delta: "stable",
      icon: KeyRound,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-500/10 hover:bg-amber-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your product microservice.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border animate-pulse">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 rounded bg-muted"></div>
                    <div className="h-8 w-16 rounded bg-muted"></div>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-muted"></div>
                </div>
                <div className="mt-4 h-3 w-32 rounded bg-muted"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <p className="font-semibold">Error loading statistics</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((s) => (
            <Card key={s.label} className="border-border hover:shadow-md transition-all duration-300 hover:border-primary/20 group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="text-sm text-muted-foreground">{s.label}</div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight">{s.value}</div>
                  </div>
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${s.bgColor} transition-colors duration-300`}>
                    <s.icon className={`h-4 w-4 ${s.iconColor}`} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span>{s.delta} this month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

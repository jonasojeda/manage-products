import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Prodly" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("alex@acme.io");
  const [password, setPassword] = useState("password");

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-background">
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-border shadow-sm">
          <CardContent className="p-8">
            <div className="mb-8 flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Boxes className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold">Prodly</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your admin dashboard.</p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/dashboard" });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a className="text-xs text-muted-foreground hover:text-foreground" href="#">
                    Forgot password?
                  </a>
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="remember" defaultChecked />
                <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                  Remember me for 30 days
                </Label>
              </div>
              <Button type="submit" className="w-full">Sign in</Button>
              <p className="text-center text-xs text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/login" className="text-foreground hover:underline">Contact sales</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="relative hidden overflow-hidden bg-muted lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary)_0%,transparent_55%)] opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="text-sm font-medium text-muted-foreground">Product Microservice · v2.4</div>
          <div>
            <h2 className="max-w-md text-3xl font-semibold tracking-tight">
              Manage products, categories and API access from one place.
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              A focused control plane for your catalog. Issue API tokens, import via CSV, and keep your microservice in sync.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

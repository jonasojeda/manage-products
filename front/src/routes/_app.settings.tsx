import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Prodly" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences.</p>
      </div>

      <Card className="border-border">
        <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14"><AvatarFallback>AM</AvatarFallback></Avatar>
            <Button variant="outline" size="sm">Change avatar</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Full name</Label><Input defaultValue="Alex Morgan" /></div>
            <div className="space-y-2"><Label>Email</Label><Input defaultValue="alex@acme.io" /></div>
            <div className="space-y-2"><Label>Role</Label><Input defaultValue="Administrator" disabled /></div>
            <div className="space-y-2"><Label>Timezone</Label><Input defaultValue="Europe/Madrid" /></div>
          </div>
          <div className="flex justify-end"><Button onClick={() => toast.success("Profile saved")}>Save changes</Button></div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Pref label="Email notifications" description="Receive product activity updates" defaultChecked />
          <Pref label="Weekly summary" description="Recap of catalog changes every Monday" defaultChecked />
          <Pref label="API usage alerts" description="Notify when a token is rate-limited" />
          <Pref label="Beta features" description="Try experimental features early" />
        </CardContent>
      </Card>
    </div>
  );
}

function Pref({ label, description, defaultChecked }: { label: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

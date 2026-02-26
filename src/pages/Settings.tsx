import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, CreditCard, Sparkles } from "lucide-react";

const planConfig: Record<string, { label: string; badge: string }> = {
  starter: { label: "Starter", badge: "bg-muted text-muted-foreground" },
  pro: { label: "Pro", badge: "bg-primary/20 text-primary" },
  team: { label: "Team", badge: "bg-warning/20 text-warning" },
};

const Settings = () => {
  const { user } = useOutletContext<{ user: any }>();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [contractCount, setContractCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: p }, { count }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("contracts").select("*", { count: "exact", head: true }),
      ]);
      setProfile(p);
      setContractCount(count || 0);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return <div className="animate-pulse text-muted-foreground p-8">Loading settings...</div>;
  }

  const plan = profile?.plan || "starter";
  const limit = profile?.plan_limit || 5;
  const cfg = planConfig[plan] || planConfig.starter;
  const usagePercent = Math.min((contractCount / limit) * 100, 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and billing.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="billing" className="gap-2"><CreditCard className="h-4 w-4" /> Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="gradient-card border-border/50">
            <CardHeader><CardTitle className="text-base">Profile Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <Input value={user.email} disabled className="mt-1 bg-secondary/30" />
              </div>
              <div>
                <Label className="text-muted-foreground">Display Name</Label>
                <Input placeholder="Your name" className="mt-1" defaultValue={user.user_metadata?.full_name || ""} />
              </div>
              <Button onClick={() => toast({ title: "Profile saved" })}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <div className="space-y-4">
            <Card className="gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  Current Plan
                  <Badge variant="outline" className={cfg.badge}>{cfg.label}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Contracts used</span>
                    <span className="font-mono font-bold">{contractCount} / {limit}</span>
                  </div>
                  <Progress value={usagePercent} className="h-2" />
                </div>
                {profile?.current_period_end && (
                  <p className="text-xs text-muted-foreground">
                    Next billing date: {new Date(profile.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="gradient-card border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" /> Upgrade your plan
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get more contracts, priority analysis, and team features.
                    </p>
                  </div>
                  <Button className="shadow-glow" onClick={() => toast({ title: "Stripe integration coming soon" })}>
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

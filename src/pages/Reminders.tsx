import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Clock, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, format } from "date-fns";

interface ReminderWithContract {
  id: string;
  reminder_date: string;
  type: string;
  dismissed: boolean;
  snoozed_until: string | null;
  contract_id: string;
  contracts: {
    name: string;
    vendor: string;
    renewal_date: string | null;
  };
}

const Reminders = () => {
  const { user } = useOutletContext<{ user: any }>();
  const [reminders, setReminders] = useState<ReminderWithContract[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReminders = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("reminders")
      .select("*, contracts(name, vendor, renewal_date)")
      .eq("dismissed", false)
      .or(`snoozed_until.is.null,snoozed_until.lte.${today}`)
      .order("reminder_date", { ascending: true });

    if (!error) setReminders((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchReminders();
  }, [user]);

  const handleDismiss = async (id: string) => {
    await supabase.from("reminders").update({ dismissed: true }).eq("id", id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Reminder dismissed" });
  };

  const handleSnooze = async (id: string) => {
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + 7);
    await supabase.from("reminders").update({ snoozed_until: snoozeDate.toISOString().split("T")[0] }).eq("id", id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Snoozed for 1 week" });
  };

  const getUrgencyStyle = (daysUntil: number) => {
    if (daysUntil < 7) return { badge: "bg-destructive/20 text-destructive border-destructive/30", dot: "bg-destructive" };
    if (daysUntil < 30) return { badge: "bg-warning/20 text-warning border-warning/30", dot: "bg-warning" };
    return { badge: "bg-primary/20 text-primary border-primary/30", dot: "bg-primary" };
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground p-8">Loading reminders...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black">Reminders</h1>
        <p className="text-sm text-muted-foreground">Upcoming contract renewals and deadlines.</p>
      </div>

      {reminders.length === 0 ? (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Bell className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">No upcoming reminders</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Reminders are set automatically when contracts are analyzed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => {
            const daysUntil = differenceInDays(new Date(r.reminder_date), new Date());
            const urgency = getUrgencyStyle(daysUntil);
            const contract = r.contracts;

            return (
              <Card key={r.id} className="gradient-card border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-3 w-3 rounded-full shrink-0 ${urgency.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{contract?.name}</p>
                    <p className="text-sm text-muted-foreground">{contract?.vendor}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs shrink-0 ${urgency.badge}`}>
                    <CalendarDays className="mr-1 h-3 w-3" />
                    {daysUntil <= 0 ? "Overdue" : `${daysUntil}d left`}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize shrink-0">
                    {r.type}
                  </Badge>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => handleSnooze(r.id)}>
                      <Clock className="h-3 w-3 mr-1" /> Snooze
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-muted-foreground" onClick={() => handleDismiss(r.id)}>
                      <BellOff className="h-3 w-3 mr-1" /> Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reminders;

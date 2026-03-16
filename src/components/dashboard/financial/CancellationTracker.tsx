import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarX, Clock, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Contract {
  id: string;
  name: string;
  vendor: string;
  cancellation_deadline: string | null;
  contract_value: number | null;
  auto_renewal: boolean | null;
  status: string | null;
}

interface CancellationTrackerProps {
  contracts: Contract[];
  selectedVendor: string | null;
  onRefresh: () => void;
}

const CancellationTracker = ({ contracts, selectedVendor, onRefresh }: CancellationTrackerProps) => {
  const { toast } = useToast();
  const [handledIds, setHandledIds] = useState<Set<string>>(new Set());
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [generatedLetters, setGeneratedLetters] = useState<Record<string, string>>({});

  const now = new Date();

  const urgent = contracts
    .filter(c => c.status === "Reviewed" && c.cancellation_deadline)
    .filter(c => !selectedVendor || c.vendor === selectedVendor)
    .map(c => {
      const deadline = new Date(c.cancellation_deadline!);
      const daysLeft = differenceInDays(deadline, now);
      const valueAtRisk = c.auto_renewal ? (c.contract_value || 0) : 0;
      return { ...c, deadline, daysLeft, valueAtRisk };
    })
    .filter(c => c.daysLeft <= 90 && c.daysLeft > -7) // within 90 days or just past
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const handleMarkHandled = (id: string) => {
    setHandledIds(prev => new Set([...prev, id]));
    toast({ title: "Marked as handled" });
  };

  const handleGenerateLetter = async (contract: typeof urgent[0]) => {
    setGeneratingFor(contract.id);
    try {
      const { data, error } = await supabase.functions.invoke("draft-negotiation-email", {
        body: {
          vendor: contract.vendor,
          contractName: contract.name,
          annualValue: contract.contract_value || 0,
          type: "cancellation",
          cancelByDate: format(contract.deadline, "MMMM d, yyyy"),
        },
      });
      if (error) throw error;
      setGeneratedLetters(prev => ({ ...prev, [contract.id]: data.email }));
    } catch (err) {
      toast({ title: "Failed to generate letter", variant: "destructive" });
    } finally {
      setGeneratingFor(null);
    }
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return "text-destructive";
    if (days <= 30) return "text-warning";
    return "text-primary";
  };

  const getUrgencyBg = (days: number) => {
    if (days <= 7) return "bg-destructive/10 border-destructive/20";
    if (days <= 30) return "bg-warning/10 border-warning/20";
    return "bg-primary/10 border-primary/20";
  };

  return (
    <div className="gradient-card rounded-xl border border-border/50 p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <CalendarX className="h-5 w-5 text-destructive" />
        <h3 className="text-base font-bold text-foreground">Cancellation Tracker</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {urgent.length} within 90 days
        </span>
      </div>

      {urgent.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No contracts with upcoming cancellation deadlines.
        </p>
      ) : (
        <div className="space-y-2">
          {urgent.map(c => {
            const isHandled = handledIds.has(c.id);

            return (
              <div
                key={c.id}
                className={`rounded-lg border p-3 transition-all ${
                  isHandled ? "opacity-50 bg-secondary/20 border-border/20" : getUrgencyBg(c.daysLeft)
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.vendor}</p>
                    <p className="text-xs text-muted-foreground">{c.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <Clock className={`h-3 w-3 ${getUrgencyColor(c.daysLeft)}`} />
                      <span className={`text-sm font-mono font-bold ${getUrgencyColor(c.daysLeft)}`}>
                        {c.daysLeft <= 0 ? "OVERDUE" : `${c.daysLeft}d left`}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(c.deadline, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {c.valueAtRisk > 0 && (
                  <p className="text-xs text-destructive mb-2 font-mono">
                    ${c.valueAtRisk.toLocaleString()}/yr at risk if auto-renewed
                  </p>
                )}

                {generatedLetters[c.id] && (
                  <div className="bg-background/50 border border-border/30 rounded-lg p-3 mb-2 max-h-36 overflow-y-auto">
                    <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {generatedLetters[c.id]}
                    </pre>
                  </div>
                )}

                {!isHandled && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs flex-1"
                      onClick={() => handleGenerateLetter(c)}
                      disabled={generatingFor === c.id}
                    >
                      {generatingFor === c.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                      {generatedLetters[c.id] ? "Regenerate Letter" : "Generate Cancellation Letter"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-xs text-primary"
                      onClick={() => handleMarkHandled(c.id)}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Handled
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CancellationTracker;

import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ChevronRight, AlertTriangle, Clock } from "lucide-react";
import { differenceInDays } from "date-fns";

interface Contract {
  id: string;
  name: string;
  vendor: string;
  risk_score: string | null;
  auto_renewal: boolean | null;
  cancellation_deadline: string | null;
  expiry_date: string | null;
  renewal_date: string | null;
  contract_value: number | null;
  status: string | null;
}

interface Clause {
  contract_id: string;
  clause_type: string;
  severity: string;
}

interface RiskFlagsPanelProps {
  contracts: Contract[];
  clauses: Clause[];
  selectedVendor: string | null;
}

const riskColors: Record<string, string> = {
  High: "bg-destructive/20 text-destructive border-destructive/30",
  Medium: "bg-warning/20 text-warning border-warning/30",
  Low: "bg-primary/20 text-primary border-primary/30",
};

const RiskFlagsPanel = ({ contracts, clauses, selectedVendor }: RiskFlagsPanelProps) => {
  const navigate = useNavigate();
  const now = new Date();

  const scored = contracts
    .filter(c => c.status === "Reviewed")
    .filter(c => !selectedVendor || c.vendor === selectedVendor)
    .map(c => {
      const hasPriceEscalation = clauses.some(
        cl => cl.contract_id === c.id &&
          (cl.clause_type.toLowerCase().includes("price") || cl.clause_type.toLowerCase().includes("escalation"))
      );

      const renewalDate = c.renewal_date ? new Date(c.renewal_date) : null;
      const autoRenewalSoon = c.auto_renewal && renewalDate &&
        differenceInDays(renewalDate, now) <= 60 && differenceInDays(renewalDate, now) > 0;

      const cancelDeadline = c.cancellation_deadline ? new Date(c.cancellation_deadline) : null;
      const daysToAct = cancelDeadline ? differenceInDays(cancelDeadline, now) : null;

      let nextAction = "Review contract terms";
      if (autoRenewalSoon) nextAction = "Send cancellation notice before auto-renewal";
      else if (hasPriceEscalation) nextAction = "Negotiate pricing before renewal";
      else if (daysToAct !== null && daysToAct <= 30) nextAction = "Take action before cancellation deadline";

      return { ...c, hasPriceEscalation, autoRenewalSoon, daysToAct, nextAction };
    })
    .sort((a, b) => {
      const riskOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
      return (riskOrder[a.risk_score || "Low"] || 2) - (riskOrder[b.risk_score || "Low"] || 2);
    });

  return (
    <div className="gradient-card rounded-xl border border-border/50 p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="h-5 w-5 text-destructive" />
        <h3 className="text-base font-bold text-foreground">Risk Flags</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {scored.filter(c => c.risk_score === "High").length} high risk
        </span>
      </div>

      {scored.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No reviewed contracts to analyze.</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {scored.map(c => (
            <button
              key={c.id}
              onClick={() => navigate(`/contracts/${c.id}`)}
              className="w-full text-left p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">{c.vendor}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${riskColors[c.risk_score || "Low"]}`}>
                    {c.risk_score}
                  </Badge>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1.5">{c.nextAction}</p>
              {c.daysToAct !== null && (
                <div className="flex items-center gap-1.5">
                  <Clock className={`h-3 w-3 ${c.daysToAct <= 7 ? "text-destructive" : c.daysToAct <= 30 ? "text-warning" : "text-primary"}`} />
                  <span className={`text-xs font-mono font-semibold ${c.daysToAct <= 7 ? "text-destructive" : c.daysToAct <= 30 ? "text-warning" : "text-primary"}`}>
                    {c.daysToAct} days to act
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiskFlagsPanel;

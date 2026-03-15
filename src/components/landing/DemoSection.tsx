import { AlertTriangle, Lock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DemoSectionProps {
  onStartTrial: () => void;
  onSignup: () => void;
  onSampleScan?: () => void;
}

const sampleAnalysis = {
  risk_score: "HIGH",
  vendor_name: "CloudBase Inc.",
  contract_value: 24000,
  renewal_date: "2026-03-31",
  cancellation_deadline: "2026-01-30",
  auto_renewal: true,
  notice_period_days: 60,
  clauses: [
    {
      clause_type: "Auto-Renewal",
      severity: "high",
      summary: "Contract automatically renews for 12 months unless cancelled with 60 days written notice before the renewal date.",
      raw_text: "This Agreement shall automatically renew for successive twelve (12) month periods unless either party provides written notice of non-renewal at least sixty (60) days prior to the end of the then-current term.",
      action_required: "Send cancellation notice before Jan 30, 2026",
    },
    {
      clause_type: "Price Escalation",
      severity: "high",
      summary: "Vendor may increase pricing by up to 15% annually without prior approval. Increases take effect automatically at each renewal.",
      raw_text: "Licensor reserves the right to increase subscription fees by up to fifteen percent (15%) upon each renewal period.",
      action_required: "Negotiate price cap before renewal",
    },
    {
      clause_type: "Cancellation Deadline",
      severity: "high",
      summary: "Cancellation Deadline: Jan 30, 2026 — Act before this date or you are locked in for another 12 months.",
      raw_text: "Written notice of non-renewal must be received at least sixty (60) days prior to the renewal date.",
      action_required: "Mark calendar for Jan 30, 2026",
    },
    {
      clause_type: "Early Termination Fee",
      severity: "high",
      summary: "Early exit requires payment of 100% of the remaining contract value. No partial refunds available.",
      raw_text: "In the event of early termination by the Licensee, the Licensee shall pay the full remaining balance of the contract term.",
      action_required: "Avoid early termination — wait for renewal window",
    },
  ],
};

const clauseDisplay = [
  {
    type: "Auto-Renewal",
    severity: "HIGH",
    summary: "Contract automatically renews for 12 months unless cancelled with 60 days written notice before the renewal date.",
    tag: "🔴 HIGH RISK",
    tagClass: "bg-destructive/20 text-destructive border-destructive/30",
  },
  {
    type: "Price Escalation",
    severity: "HIGH",
    summary: "Vendor may increase pricing by up to 15% annually without prior approval. Increases take effect automatically at each renewal.",
    tag: "🔴 HIGH RISK",
    tagClass: "bg-destructive/20 text-destructive border-destructive/30",
    showNegotiationCta: true,
  },
  {
    type: "⚠️ Cancellation Deadline",
    severity: "URGENT",
    summary: "Cancellation Deadline: Jan 30, 2026 — Act before this date or you are locked in for another 12 months.",
    tag: "🟠 URGENT",
    tagClass: "bg-orange-500/20 text-orange-500 border-orange-500/30",
  },
  {
    type: "Early Termination Fee",
    severity: "HIGH",
    summary: "Early exit requires payment of 100% of the remaining contract value. No partial refunds available.",
    tag: "🔴 HIGH RISK",
    tagClass: "bg-destructive/20 text-destructive border-destructive/30",
  },
];

const DemoSection = ({ onStartTrial, onSignup, onSampleScan }: DemoSectionProps) => {
  const handleSampleScan = () => {
    if (onSampleScan) {
      onSampleScan();
    }
  };

  return (
    <section className="py-20 border-t border-border/50">
      <div className="container max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black mb-3">See What ContractOwl Finds</h2>
          <p className="text-muted-foreground">Sample analysis of a real vendor contract</p>
        </div>

        <div className="gradient-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
          {/* Contract header */}
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">CloudBase Software Agreement</h3>
              <p className="text-sm text-muted-foreground">SaaS Vendor Contract • 14 pages</p>
            </div>
            <Badge variant="outline" className="text-xs bg-destructive/20 text-destructive border-destructive/30 px-3 py-1">
              <AlertTriangle className="h-3 w-3 mr-1" />
              HIGH RISK
            </Badge>
          </div>

          {/* Clauses */}
          <div className="divide-y divide-border/30">
            {clauseDisplay.map((clause, i) => (
              <div key={i} className="p-5 hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-sm">{clause.type}</span>
                  <Badge variant="outline" className={`text-[10px] ${clause.tagClass}`}>
                    {clause.tag}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{clause.summary}</p>
                {clause.showNegotiationCta && (
                  <button
                    onClick={onSignup}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    <ArrowRight className="h-3 w-3" />
                    Draft negotiation email
                  </button>
                )}
              </div>
            ))}

            {/* Blurred 5th clause */}
            <div className="relative p-5">
              <div className="blur-sm select-none pointer-events-none">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-sm">Liability Limitation</span>
                  <Badge variant="outline" className="text-[10px] bg-warning/20 text-warning border-warning/30">
                    🟡 MEDIUM RISK
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Vendor's total liability is capped at the fees paid in the last 12 months. This excludes indirect and consequential damages.
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                <Button variant="outline" className="gap-2" onClick={onSignup}>
                  <Lock className="h-4 w-4" />
                  Sign up to see full report →
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sample scan CTA */}
        <div className="text-center mt-6">
          <Button
            variant="outline"
            className="gap-2 text-sm"
            onClick={handleSampleScan}
          >
            <ArrowRight className="h-4 w-4" />
            Try it with this sample contract
          </Button>
        </div>
      </div>
    </section>
  );
};

export { sampleAnalysis };
export default DemoSection;

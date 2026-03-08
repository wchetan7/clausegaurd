import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft, Download, Share2, Bell, AlertTriangle,
  Clock, DollarSign, CalendarDays, RefreshCw, ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import { exportContractPdf } from "@/lib/exportContractPdf";

const severityConfig: Record<string, { color: string; icon: string; badgeClass: string }> = {
  HIGH: { color: "text-destructive", icon: "🔴", badgeClass: "bg-destructive/20 text-destructive border-destructive/30" },
  MEDIUM: { color: "text-warning", icon: "🟡", badgeClass: "bg-warning/20 text-warning border-warning/30" },
  LOW: { color: "text-primary", icon: "🟢", badgeClass: "bg-primary/20 text-primary border-primary/30" },
};

const riskBadgeClass: Record<string, string> = {
  Low: "bg-primary/20 text-primary border-primary/40 text-lg px-4 py-1",
  Medium: "bg-warning/20 text-warning border-warning/40 text-lg px-4 py-1",
  High: "bg-destructive/20 text-destructive border-destructive/40 text-lg px-4 py-1",
};

const ContractAnalysis = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useOutletContext<{ user: any }>();
  const [contract, setContract] = useState<any>(null);
  const [clauses, setClauses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    const fetchData = async () => {
      const [{ data: c }, { data: cl }] = await Promise.all([
        supabase.from("contracts").select("*").eq("id", id).single(),
        supabase.from("contract_clauses").select("*").eq("contract_id", id).order("severity"),
      ]);
      setContract(c);
      setClauses(cl || []);
      setLoading(false);
    };
    fetchData();
  }, [user, id]);

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading analysis...</div>;
  }

  if (!contract) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h2 className="text-xl font-bold mb-4">Contract not found</h2>
        <p className="text-muted-foreground mb-6">This contract may have been deleted or you don't have access.</p>
        <Button onClick={() => navigate("/dashboard", { replace: true })}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const sortedClauses = [...clauses].sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return (order[a.severity as keyof typeof order] ?? 3) - (order[b.severity as keyof typeof order] ?? 3);
  });

  const hasAutoRenewalClause = clauses.some(
    (c) => c.clause_type?.toLowerCase().includes("auto_renewal") || c.clause_type?.toLowerCase().includes("auto-renewal")
  );
  const effectiveAutoRenewal = hasAutoRenewalClause ? true : contract.auto_renewal;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate("/dashboard", { replace: true })} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">{contract.name}</h1>
          <p className="text-muted-foreground">{contract.vendor}</p>
          {contract.owner_name && (
            <p className="text-sm text-muted-foreground mt-1">Owner: {contract.owner_name}</p>
          )}
        </div>
        <Badge variant="outline" className={riskBadgeClass[contract.risk_score] || riskBadgeClass.Low}>
          <ShieldAlert className="mr-1 h-4 w-4" />
          {contract.risk_score} Risk
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gradient-card border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Contract Value</p>
              <p className="font-bold">${(contract.contract_value || 0).toLocaleString()}/yr</p>
            </div>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-warning" />
            <div>
              <p className="text-xs text-muted-foreground">Renewal Date</p>
              <p className="font-bold">{contract.renewal_date ? format(new Date(contract.renewal_date), "MMM d, yyyy") : "N/A"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Notice Period</p>
              <p className="font-bold">{contract.notice_period_days ? `${contract.notice_period_days} days` : "N/A"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <RefreshCw className={`h-5 w-5 ${effectiveAutoRenewal ? "text-destructive" : "text-primary"}`} />
            <div>
              <p className="text-xs text-muted-foreground">Auto-Renewal</p>
              <p className="font-bold">{effectiveAutoRenewal ? "Yes" : "No"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3">Extracted Clauses</h2>
        {sortedClauses.length === 0 ? (
          <Card className="gradient-card border-border/50">
            <CardContent className="p-8 text-center text-muted-foreground">
              No clauses extracted yet. The contract may still be analyzing.
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-3">
            {sortedClauses.map((clause, i) => {
              const cfg = severityConfig[clause.severity] || severityConfig.LOW;
              return (
                <AccordionItem key={clause.id || i} value={`clause-${i}`} className="gradient-card rounded-xl border border-border/50 px-4 overflow-hidden">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <span>{cfg.icon}</span>
                      <span className="font-semibold">{clause.clause_type}</span>
                      <Badge variant="outline" className={`text-xs ${cfg.badgeClass}`}>{clause.severity}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-3">
                    <p className="text-sm text-foreground">{clause.summary}</p>
                    <div className="bg-background/50 border border-border/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Exact contract text:</p>
                      <p className="text-sm font-mono text-muted-foreground leading-relaxed">"{clause.raw_text}"</p>
                    </div>
                    {clause.action_required && (
                      <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-destructive">Action Required</p>
                          <p className="text-sm text-foreground">{clause.action_required}</p>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Renewal Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            We'll remind you 90, 60, and 30 days before your renewal date so you never miss a cancellation window.
          </p>
          <Button variant="outline" className="gap-2"><Bell className="h-4 w-4" /> Set Reminder</Button>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" className="gap-2" onClick={() => exportContractPdf(contract, clauses)}><Download className="h-4 w-4" /> Download Report PDF</Button>
        <Button variant="outline" className="gap-2"><Share2 className="h-4 w-4" /> Share with Team</Button>
      </div>
    </div>
  );
};

export default ContractAnalysis;

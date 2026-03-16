import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Mail, Loader2, TrendingUp, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Contract {
  id: string;
  name: string;
  vendor: string;
  contract_value: number | null;
  status: string | null;
}

interface Clause {
  contract_id: string;
  clause_type: string;
  severity: string;
  summary: string;
  raw_text: string;
}

interface NegotiationLeveragePanelProps {
  contracts: Contract[];
  clauses: Clause[];
  selectedVendor: string | null;
}

const NegotiationLeveragePanel = ({ contracts, clauses, selectedVendor }: NegotiationLeveragePanelProps) => {
  const { toast } = useToast();
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [generatedEmails, setGeneratedEmails] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Find contracts with price escalation clauses
  const escalationContracts = contracts
    .filter(c => c.status === "Reviewed")
    .filter(c => !selectedVendor || c.vendor === selectedVendor)
    .map(c => {
      const escalationClauses = clauses.filter(
        cl => cl.contract_id === c.id &&
          (cl.clause_type.toLowerCase().includes("price") ||
           cl.clause_type.toLowerCase().includes("escalation") ||
           cl.clause_type.toLowerCase().includes("increase"))
      );
      if (escalationClauses.length === 0) return null;

      // Estimate max increase - look for percentages in clause text
      const percentMatch = escalationClauses
        .map(cl => cl.raw_text.match(/(\d+(?:\.\d+)?)\s*%/))
        .find(m => m);
      const maxPct = percentMatch ? parseFloat(percentMatch[1]) : 10;
      const annualValue = c.contract_value || 0;
      const maxIncrease = Math.round(annualValue * (maxPct / 100));

      return {
        ...c,
        escalationClauses,
        maxPct,
        maxIncrease,
        annualValue,
      };
    })
    .filter(Boolean) as NonNullable<ReturnType<typeof Array.prototype.map>[number]>[];

  const handleDraftEmail = async (contract: typeof escalationContracts[0]) => {
    setGeneratingFor(contract.id);
    try {
      const { data, error } = await supabase.functions.invoke("draft-negotiation-email", {
        body: {
          vendor: contract.vendor,
          contractName: contract.name,
          annualValue: contract.annualValue,
          maxPct: contract.maxPct,
          clauseSummaries: contract.escalationClauses.map((cl: any) => cl.summary),
        },
      });

      if (error) throw error;
      setGeneratedEmails(prev => ({ ...prev, [contract.id]: data.email }));
    } catch (err) {
      toast({ title: "Failed to generate email", description: "Please try again.", variant: "destructive" });
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="gradient-card rounded-xl border border-border/50 p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-warning" />
        <h3 className="text-base font-bold text-foreground">Negotiation Leverage</h3>
      </div>

      {escalationContracts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No price escalation clauses detected in your contracts.
        </p>
      ) : (
        <div className="space-y-3">
          {escalationContracts.map((c: any) => (
            <Card key={c.id} className="bg-secondary/30 border-border/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.vendor}</p>
                    <p className="text-xs text-muted-foreground">{c.name}</p>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">
                    Price Escalation
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-background/30 rounded-lg p-2.5">
                    <p className="text-xs text-muted-foreground">Current Annual</p>
                    <p className="text-sm font-mono font-bold text-foreground">
                      ${c.annualValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-destructive/5 border border-destructive/10 rounded-lg p-2.5">
                    <p className="text-xs text-muted-foreground">Max Possible Increase</p>
                    <p className="text-sm font-mono font-bold text-destructive">
                      Up to {c.maxPct}% = ${c.maxIncrease.toLocaleString()} extra
                    </p>
                  </div>
                </div>

                {generatedEmails[c.id] ? (
                  <div className="space-y-2">
                    <div className="bg-background/50 border border-border/30 rounded-lg p-3 max-h-48 overflow-y-auto">
                      <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                        {generatedEmails[c.id]}
                      </pre>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        onClick={() => handleCopy(c.id, generatedEmails[c.id])}
                      >
                        {copiedId === c.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copiedId === c.id ? "Copied" : "Copy Email"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-xs"
                        onClick={() => handleDraftEmail(c)}
                        disabled={generatingFor === c.id}
                      >
                        <Mail className="h-3 w-3" /> Regenerate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs w-full bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                    onClick={() => handleDraftEmail(c)}
                    disabled={generatingFor === c.id}
                  >
                    {generatingFor === c.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Mail className="h-3 w-3" />
                    )}
                    Draft Negotiation Email
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NegotiationLeveragePanel;

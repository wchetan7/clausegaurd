import { useNavigate } from "react-router-dom";
import { FileText, Upload, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Contract {
  id: string;
  name: string;
  vendor: string;
  renewal_date: string | null;
  risk_score: string;
  status: string;
  contract_value: number;
}

interface ContractsTableProps {
  contracts: Contract[];
  onUpload: () => void;
}

const statusConfig: Record<string, { label: string; className: string; pulse?: boolean }> = {
  Scanning: { label: "Scanning...", className: "bg-blue-500/20 text-blue-400 border-blue-500/30", pulse: true },
  Reviewed: { label: "Reviewed", className: "bg-primary/20 text-primary border-primary/30" },
  "Action Required": { label: "Action Required", className: "bg-destructive/20 text-destructive border-destructive/30" },
  Archived: { label: "Archived", className: "bg-muted/40 text-muted-foreground border-border" },
};

const riskColors: Record<string, string> = {
  Low: "bg-primary/20 text-primary border-primary/30",
  Medium: "bg-warning/20 text-warning border-warning/30",
  High: "bg-destructive/20 text-destructive border-destructive/30",
};

const ContractsTable = ({ contracts, onUpload }: ContractsTableProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRetry = async (e: React.MouseEvent, contractId: string) => {
    e.stopPropagation();
    const { error } = await supabase.from("contracts").update({ status: "Scanning", risk_score: null }).eq("id", contractId);
    if (error) {
      toast({ title: "Failed to queue retry", variant: "destructive" });
    } else {
      toast({ title: "Contract queued for re-analysis" });
    }
  };

  const getQueuePosition = (contractId: string) => {
    const queued = contracts.filter((c) => c.status === "Scanning");
    const idx = queued.findIndex((c) => c.id === contractId);
    return idx >= 0 ? idx + 1 : null;
  };

  if (contracts.length === 0) {
    return (
      <div className="gradient-card rounded-xl border border-border/50 p-16 text-center shadow-card">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <FileText className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">No contracts yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          Upload your first contract to get started with AI-powered risk analysis.
        </p>
        <Button onClick={onUpload}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Your First Contract
        </Button>
      </div>
    );
  }

  const isProcessing = (status: string) => status === "Scanning";

  return (
    <div className="gradient-card rounded-xl border border-border/50 shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 text-left">
              <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Contract</th>
              <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Vendor</th>
              <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Renewal</th>
              <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk</th>
              <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Value</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {contracts.map((c) => {
              const status = c.status || "";
              const config = statusConfig[status] || { label: status, className: "bg-muted/40 text-muted-foreground border-border" };
              const queuePos = status === "Scanning" ? getQueuePosition(c.id) : null;

              const handleRowClick = () => {
                if (status === "Reviewed") {
                  navigate(`/contracts/${c.id}`);
                } else if (status === "Action Required") {
                  toast({ title: "Analysis had issues — click Retry to reprocess", variant: "destructive" });
                } else if (status === "Scanning") {
                  toast({ title: "Still analyzing — check back soon" });
                }
              };

              return (
                <tr key={c.id} className="group hover:bg-secondary/30 transition-colors cursor-pointer" onClick={handleRowClick}>
                  <td className="px-5 py-4 text-sm font-medium">{c.name}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{c.vendor}</td>
                  <td className="px-5 py-4 text-sm">
                    {c.renewal_date ? (
                      <span className="text-muted-foreground">{format(new Date(c.renewal_date), "MMM d, yyyy")}</span>
                    ) : (
                      <span className="text-warning font-medium">Check contract</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {isProcessing(status) ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                        Scanning
                      </span>
                    ) : status === "Action Required" ? (
                      <Badge variant="outline" className="text-xs bg-destructive/20 text-destructive border-destructive/30">
                        Needs Review
                      </Badge>
                    ) : (
                      <Badge variant="outline" className={`text-xs ${riskColors[c.risk_score] || ""}`}>
                        {c.risk_score || "—"}
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${config.className} ${config.pulse ? "animate-pulse" : ""}`}
                      >
                        {status === "Scanning" && queuePos ? `Position ${queuePos} in queue` : config.label}
                      </Badge>
                      {status === "Action Required" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                          onClick={(e) => handleRetry(e, c.id)}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-mono">${(c.contract_value || 0).toLocaleString()}/yr</td>
                  <td className="px-3 py-4">
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContractsTable;

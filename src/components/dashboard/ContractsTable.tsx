import { useNavigate } from "react-router-dom";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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

const riskColors: Record<string, string> = {
  Low: "bg-primary/20 text-primary border-primary/30",
  Medium: "bg-warning/20 text-warning border-warning/30",
  High: "bg-destructive/20 text-destructive border-destructive/30",
};

const ContractsTable = ({ contracts, onUpload }: ContractsTableProps) => {
  const navigate = useNavigate();
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
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {contracts.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => navigate(`/contract/${c.id}`)}>
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
                  {c.status === "Scanning" || c.status === "Analyzing" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                      Scanning
                    </span>
                  ) : (
                    <Badge variant="outline" className={`text-xs ${riskColors[c.risk_score] || ""}`}>
                      {c.risk_score}
                    </Badge>
                  )}
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{c.status}</td>
                <td className="px-5 py-4 text-sm font-mono">${(c.contract_value || 0).toLocaleString()}/yr</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContractsTable;

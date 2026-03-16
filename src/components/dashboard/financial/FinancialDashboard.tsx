import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, BarChart3 } from "lucide-react";
import VendorSpendSummary from "./VendorSpendSummary";
import CostProjectionChart from "./CostProjectionChart";
import RiskFlagsPanel from "./RiskFlagsPanel";
import NegotiationLeveragePanel from "./NegotiationLeveragePanel";
import CancellationTracker from "./CancellationTracker";

interface FinancialDashboardProps {
  contracts: any[];
  onUpload: () => void;
  onRefresh: () => void;
}

const FinancialDashboard = ({ contracts, onUpload, onRefresh }: FinancialDashboardProps) => {
  const [clauses, setClauses] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  useEffect(() => {
    const contractIds = contracts.map(c => c.id);
    if (contractIds.length === 0) return;

    const fetchClauses = async () => {
      const { data } = await supabase
        .from("contract_clauses")
        .select("contract_id, clause_type, severity, summary, raw_text")
        .in("contract_id", contractIds);
      setClauses(data || []);
    };
    fetchClauses();
  }, [contracts]);

  // Empty state
  if (contracts.length === 0) {
    return (
      <div className="gradient-card rounded-xl border border-border/50 p-16 text-center shadow-card">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <BarChart3 className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">Financial Intelligence Dashboard</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Scan your first contract to unlock your Financial Intelligence Dashboard — 
          see total spend, cost projections, risk analysis, and negotiation opportunities.
        </p>
        <Button onClick={onUpload} size="lg" className="shadow-glow">
          <Upload className="mr-2 h-4 w-4" />
          Scan Your First Contract
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vendor Spend Summary */}
      <VendorSpendSummary
        contracts={contracts}
        selectedVendor={selectedVendor}
        onVendorSelect={setSelectedVendor}
      />

      {/* Cost Projection Chart */}
      <CostProjectionChart
        contracts={contracts}
        selectedVendor={selectedVendor}
      />

      {/* Bottom grid: Risk + Negotiation + Cancellation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RiskFlagsPanel
          contracts={contracts}
          clauses={clauses}
          selectedVendor={selectedVendor}
        />
        <NegotiationLeveragePanel
          contracts={contracts}
          clauses={clauses}
          selectedVendor={selectedVendor}
        />
        <CancellationTracker
          contracts={contracts}
          selectedVendor={selectedVendor}
          onRefresh={onRefresh}
        />
      </div>
    </div>
  );
};

export default FinancialDashboard;

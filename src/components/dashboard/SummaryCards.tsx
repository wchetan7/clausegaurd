import { FileText, AlertTriangle, ShieldAlert, DollarSign } from "lucide-react";

interface Contract {
  id: string;
  risk_score: string;
  renewal_date: string | null;
  contract_value: number;
  status: string;
}

interface SummaryCardsProps {
  contracts: Contract[];
}

const SummaryCards = ({ contracts }: SummaryCardsProps) => {
  const total = contracts.length;
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiring = contracts.filter(
    (c) => c.renewal_date && new Date(c.renewal_date) <= in30 && new Date(c.renewal_date) >= now
  ).length;
  const highRisk = contracts.filter((c) => c.risk_score === "High").length;
  const mrrAtRisk = contracts
    .filter((c) => c.risk_score === "High" || c.risk_score === "Medium")
    .reduce((sum, c) => sum + (c.contract_value || 0), 0);

  const cards = [
    { label: "Total Contracts", value: total, icon: FileText, color: "text-primary" },
    { label: "Expiring in 30 Days", value: expiring, icon: AlertTriangle, color: "text-warning" },
    { label: "High Risk", value: highRisk, icon: ShieldAlert, color: "text-destructive" },
    { label: "MRR at Risk", value: `$${mrrAtRisk.toLocaleString()}`, icon: DollarSign, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="gradient-card rounded-xl border border-border/50 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{card.label}</span>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </div>
          <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;

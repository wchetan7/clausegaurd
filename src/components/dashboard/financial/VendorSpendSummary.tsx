import { useMemo } from "react";
import { DollarSign } from "lucide-react";

interface Contract {
  id: string;
  vendor: string;
  contract_value: number | null;
  status: string | null;
}

interface VendorSpendSummaryProps {
  contracts: Contract[];
  selectedVendor: string | null;
  onVendorSelect: (vendor: string | null) => void;
}

const VENDOR_COLORS = [
  "hsl(84 81% 44%)",    // primary green
  "hsl(38 92% 50%)",    // warning orange
  "hsl(199 89% 48%)",   // blue
  "hsl(271 76% 53%)",   // purple
  "hsl(340 75% 55%)",   // pink
  "hsl(160 60% 45%)",   // teal
  "hsl(25 95% 53%)",    // deep orange
  "hsl(210 70% 60%)",   // steel blue
];

export const getVendorColor = (index: number) =>
  VENDOR_COLORS[index % VENDOR_COLORS.length];

const VendorSpendSummary = ({ contracts, selectedVendor, onVendorSelect }: VendorSpendSummaryProps) => {
  const activeContracts = contracts.filter(c => c.status !== "Archived");

  const { totalSpend, vendorBreakdown } = useMemo(() => {
    const vendorMap = new Map<string, number>();
    let total = 0;

    activeContracts.forEach(c => {
      const val = c.contract_value || 0;
      total += val;
      vendorMap.set(c.vendor, (vendorMap.get(c.vendor) || 0) + val);
    });

    const breakdown = Array.from(vendorMap.entries())
      .map(([vendor, spend]) => ({ vendor, spend }))
      .sort((a, b) => b.spend - a.spend);

    return { totalSpend: total, vendorBreakdown: breakdown };
  }, [activeContracts]);

  const totalBarWidth = totalSpend || 1;

  return (
    <div className="gradient-card rounded-xl border border-border/50 p-6 shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Committed Spend (Next 12 Months)</p>
          <p className="text-3xl font-black text-foreground font-mono">
            ${Math.round(totalSpend).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="h-8 rounded-lg overflow-hidden flex bg-secondary/50 mb-4">
        {vendorBreakdown.map((v, i) => {
          const widthPct = (v.spend / totalBarWidth) * 100;
          const isSelected = selectedVendor === v.vendor;
          const isDimmed = selectedVendor && selectedVendor !== v.vendor;
          return (
            <button
              key={v.vendor}
              onClick={() => onVendorSelect(isSelected ? null : v.vendor)}
              className="relative group transition-opacity"
              style={{
                width: `${widthPct}%`,
                backgroundColor: getVendorColor(i),
                opacity: isDimmed ? 0.3 : 1,
                minWidth: widthPct > 2 ? undefined : "4px",
              }}
              title={`${v.vendor}: $${v.spend.toLocaleString()}`}
            >
              {widthPct > 12 && (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary-foreground truncate px-1">
                  {v.vendor}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {vendorBreakdown.map((v, i) => {
          const isSelected = selectedVendor === v.vendor;
          const isDimmed = selectedVendor && selectedVendor !== v.vendor;
          return (
            <button
              key={v.vendor}
              onClick={() => onVendorSelect(isSelected ? null : v.vendor)}
              className={`flex items-center gap-2 text-xs px-2 py-1 rounded-md transition-all ${
                isSelected
                  ? "bg-secondary ring-1 ring-primary/30"
                  : isDimmed
                  ? "opacity-40"
                  : "hover:bg-secondary/50"
              }`}
            >
              <div
                className="h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: getVendorColor(i) }}
              />
              <span className="text-muted-foreground">{v.vendor}</span>
              <span className="font-mono font-semibold text-foreground">
                ${v.spend.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VendorSpendSummary;

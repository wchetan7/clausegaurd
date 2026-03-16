import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { AlertTriangle } from "lucide-react";
import { getVendorColor } from "./VendorSpendSummary";

interface Contract {
  id: string;
  vendor: string;
  contract_value: number | null;
  renewal_date: string | null;
  expiry_date: string | null;
  status: string | null;
}

interface CostProjectionChartProps {
  contracts: Contract[];
  selectedVendor: string | null;
}

const CostProjectionChart = ({ contracts, selectedVendor }: CostProjectionChartProps) => {
  const activeContracts = contracts.filter(c => c.status !== "Archived");

  const { chartData, vendors, renewalMonths } = useMemo(() => {
    const now = new Date();
    const vendorSet = new Set<string>();
    const renewals = new Set<string>();

    activeContracts.forEach(c => vendorSet.add(c.vendor));
    const vendorList = Array.from(vendorSet).sort();

    // Build 12 months of data
    const data = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const entry: Record<string, any> = { month: monthKey, _date: date };

      vendorList.forEach(vendor => {
        const vendorContracts = activeContracts.filter(c => c.vendor === vendor);
        let monthlySpend = 0;
        vendorContracts.forEach(c => {
          const expiry = c.expiry_date ? new Date(c.expiry_date) : null;
          // Include spend if contract hasn't expired by this month
          if (!expiry || expiry >= date) {
            monthlySpend += (c.contract_value || 0) / 12;
          }
          // Check for renewals in this month
          const renewal = c.renewal_date ? new Date(c.renewal_date) : null;
          if (renewal && renewal.getMonth() === date.getMonth() && renewal.getFullYear() === date.getFullYear()) {
            renewals.add(monthKey);
          }
        });
        entry[vendor] = Math.round(monthlySpend);
      });

      return entry;
    });

    return { chartData: data, vendors: vendorList, renewalMonths: renewals };
  }, [activeContracts]);

  const filteredVendors = selectedVendor
    ? vendors.filter(v => v === selectedVendor)
    : vendors;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const isRenewal = renewalMonths.has(label);
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
        <div className="flex items-center gap-2 mb-2">
          <p className="font-semibold text-foreground">{label}</p>
          {isRenewal && (
            <span className="flex items-center gap-1 text-warning">
              <AlertTriangle className="h-3 w-3" /> Renewal
            </span>
          )}
        </div>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.dataKey}</span>
            </div>
            <span className="font-mono font-semibold text-foreground">
              ${entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
        <div className="border-t border-border/50 mt-2 pt-2 flex justify-between">
          <span className="text-muted-foreground">Total</span>
          <span className="font-mono font-bold text-foreground">
            ${payload.reduce((s: number, p: any) => s + (p.value || 0), 0).toLocaleString()}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="gradient-card rounded-xl border border-border/50 p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-foreground">12-Month Cost Projection</h3>
          <p className="text-xs text-muted-foreground">Projected monthly spend across active contracts</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-warning">
          <AlertTriangle className="h-3 w-3" />
          <span>= Renewal month</span>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="15%">
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }}
              axisLine={{ stroke: "hsl(217 33% 22%)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(217 33% 17% / 0.5)" }} />
            {filteredVendors.map((vendor, i) => {
              const colorIndex = vendors.indexOf(vendor);
              return (
                <Bar
                  key={vendor}
                  dataKey={vendor}
                  stackId="spend"
                  fill={getVendorColor(colorIndex)}
                  radius={i === filteredVendors.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Renewal markers */}
      {renewalMonths.size > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {Array.from(renewalMonths).map(m => (
            <span key={m} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-warning/10 text-warning border border-warning/20">
              <AlertTriangle className="h-3 w-3" /> {m}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default CostProjectionChart;

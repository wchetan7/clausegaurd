import { Zap, TrendingUp, CalendarClock } from "lucide-react";

const metrics = [
  { icon: Zap, label: "Know your total vendor spend in 60 seconds" },
  { icon: TrendingUp, label: "Cancel-by dates flagged before you're locked in" },
  { icon: CalendarClock, label: "See exactly how much MRR is at risk of auto-renewing" },
];

const MetricsBar = () => {
  return (
    <section className="border-y border-border/50 py-8 bg-secondary/30">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center justify-center gap-3 text-center">
              <m.icon className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetricsBar;

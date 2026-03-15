import { BarChart3, Bell, Clock, FileText, Mail, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: BarChart3,
    title: "Cost Projection",
    description: "See your total committed vendor spend for the next 12 months across all contracts.",
    badge: null,
  },
  {
    icon: Bell,
    title: "Renewal Alerts",
    description: "Get notified before auto-renewals lock you in for another year.",
    badge: null,
  },
  {
    icon: Clock,
    title: "Cancel-By Date Tracker",
    description: "Know the exact date you need to act — not just when the contract expires.",
    badge: "most-missed" as const,
  },
  {
    icon: FileText,
    title: "Cancellation Letter Generator",
    description: "Generate a professional cancellation notice in one click.",
    badge: "coming-soon" as const,
  },
  {
    icon: Mail,
    title: "Negotiation Email Generator",
    description: "Get AI-drafted negotiation emails with leverage points pulled from your contract.",
    badge: "coming-soon" as const,
  },
  {
    icon: Wallet,
    title: "Vendor Spend Summary",
    description: "See all vendor costs in one dashboard — broken down by category and renewal date.",
    badge: null,
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 border-t border-border/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Everything you need to control vendor costs</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((f) => (
            <div
              key={f.title}
              className={`relative gradient-card rounded-2xl border p-6 hover:border-primary/40 transition-colors shadow-card group ${
                f.badge === "most-missed" ? "border-primary/30 ring-1 ring-primary/10" : "border-border/50"
              }`}
            >
              {f.badge === "coming-soon" && (
                <Badge className="absolute top-4 right-4 bg-orange-500/15 text-orange-500 border-orange-500/30 text-[10px] font-medium" variant="outline">
                  Coming Soon
                </Badge>
              )}
              {f.badge === "most-missed" && (
                <Badge className="absolute top-4 right-4 bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px] font-medium" variant="outline">
                  Most Missed
                </Badge>
              )}
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:shadow-glow transition-shadow">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

import { BarChart3, Bell, Clock, FileText, Mail, Wallet } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Cost Projection",
    description: "See your total committed vendor spend for the next 12 months across all contracts.",
  },
  {
    icon: Bell,
    title: "Renewal Alerts",
    description: "Get notified before auto-renewals lock you in for another year.",
  },
  {
    icon: Clock,
    title: "Cancel-By Date Tracker",
    description: "Know the exact date you need to act — not just when the contract expires.",
  },
  {
    icon: FileText,
    title: "Cancellation Letter Generator",
    description: "Generate a professional cancellation notice in one click.",
  },
  {
    icon: Mail,
    title: "Negotiation Email Generator",
    description: "Get AI-drafted negotiation emails with leverage points pulled from your contract.",
  },
  {
    icon: Wallet,
    title: "Vendor Spend Summary",
    description: "See all vendor costs in one dashboard — broken down by category and renewal date.",
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
              className="gradient-card rounded-2xl border border-border/50 p-6 hover:border-primary/40 transition-colors shadow-card group"
            >
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

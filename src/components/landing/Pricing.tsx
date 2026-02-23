import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingProps {
  onStartTrial: () => void;
}

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    description: "For freelancers & solo businesses",
    features: ["5 contracts/month", "Risk reports", "Email alerts", "PDF exports"],
    popular: false,
  },
  {
    name: "Pro",
    price: "$59",
    period: "/mo",
    description: "For growing small businesses",
    features: ["20 contracts/month", "Everything in Starter", "Calendar reminders", "Priority support", "Clause library"],
    popular: true,
  },
  {
    name: "Team",
    price: "$149",
    period: "/mo",
    description: "For teams that handle many vendors",
    features: ["Unlimited contracts", "Everything in Pro", "Team sharing", "Custom rules", "API access", "Dedicated CSM"],
    popular: false,
  },
];

const Pricing = ({ onStartTrial }: PricingProps) => {
  return (
    <section id="pricing" className="py-24 border-t border-border/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-lg">Start free. Upgrade when you're ready.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.popular
                  ? "border-primary shadow-glow gradient-card"
                  : "border-border/50 gradient-card shadow-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-accent px-4 py-1 text-xs font-bold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.popular ? "default" : "outline"}
                className="w-full"
                onClick={onStartTrial}
              >
                Start Free Trial
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;

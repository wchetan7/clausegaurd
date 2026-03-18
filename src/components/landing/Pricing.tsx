import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingProps {
  onStartTrial: () => void;
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Scan up to 3 contracts. See your first cost projection free.",
    features: ["3 contracts", "Cost projection", "Risk reports", "Cancel-by dates"],
    popular: false,
  },
  {
    name: "Pro",
    price: "$59",
    period: "/mo",
    description: "Full vendor cost control. Unlimited contracts, renewal calendar, and AI generators.",
    features: ["Unlimited contracts", "12-month cost projections", "Renewal calendar", "Cancel-by alerts", "Cancellation letter generator", "Negotiation email generator"],
    popular: true,
  },
  {
    name: "Team",
    price: "$149",
    period: "/mo",
    description: "For teams that handle many vendors",
    features: ["Everything in Pro", "Team sharing 🔜", "Custom rules 🔜", "API access 🔜", "Vendor spend dashboard", "Dedicated CSM"],
    popular: false,
  },
];

const Pricing = ({ onStartTrial }: PricingProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;
          (window as any).posthog?.capture("pricing_viewed");
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="py-24 border-t border-border/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-lg">Start with 3 free contracts. Upgrade when you're ready.</p>
          <p className="text-sm text-muted-foreground/70 mt-2">No long-term contracts. Cancel anytime. We'd never auto-renew you without warning — we know how that feels. 😄</p>
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
                {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
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
                {plan.price === "$0" ? "Scan Free" : "Start Free Trial"}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Your contracts are processed by Claude AI and never used for model training.
        </p>
      </div>
    </section>
  );
};

export default Pricing;

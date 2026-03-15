import { Upload, Cpu, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload your vendor contract",
    description: "PDF or paste text — we'll handle the rest.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "ContractOwl extracts everything",
    description: "Costs, dates, renewal terms, and risky clauses — extracted automatically.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "See where to save money",
    description: "Your total vendor spend, renewal calendar, and cost-saving opportunities in one view.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 border-t border-border/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">From contract to cost clarity in 3 steps</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((s) => (
            <div
              key={s.step}
              className="relative group gradient-card rounded-2xl border border-border/50 p-8 text-center hover:border-primary/40 transition-colors shadow-card"
            >
              <div className="text-xs font-mono text-primary/60 mb-4">{s.step}</div>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:shadow-glow transition-shadow">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

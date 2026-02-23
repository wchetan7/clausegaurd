import { Upload, Cpu, FileCheck } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload PDF",
    description: "Drag and drop your vendor contract — we support PDF, DOCX, and more.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Scans in 60 Seconds",
    description: "Our AI reads every clause, identifying risks, auto-renewals, and hidden fees.",
  },
  {
    icon: FileCheck,
    step: "03",
    title: "Get Risk Report",
    description: "Receive a detailed risk report with calendar reminders for key dates.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 border-t border-border/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Three simple steps to protect your business from contract traps.
          </p>
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

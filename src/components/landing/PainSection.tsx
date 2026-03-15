import { X, Check } from "lucide-react";

const before = [
  "No leverage when renegotiating",
  "Auto-renewals triggering without warning",
  "No idea what you're committed to next quarter",
  "Renewal dates buried in PDFs",
];

const after = [
  "Every renewal date visible in one dashboard",
  "12-month vendor cost projection always up to date",
  "Cancel-by alerts 60 days before auto-renewal",
  "Negotiation emails generated from contract terms",
];

const PainSection = () => {
  return (
    <section className="py-24 border-t border-border/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Stop guessing what your vendors cost you</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Before */}
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8">
            <h3 className="text-lg font-bold mb-6 text-destructive">Before ContractOwl</h3>
            <ul className="space-y-4">
              {before.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8">
            <h3 className="text-lg font-bold mb-6 text-primary">After ContractOwl</h3>
            <ul className="space-y-4">
              {after.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PainSection;

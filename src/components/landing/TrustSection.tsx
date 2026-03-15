import { Lock, Bot, User, Ban } from "lucide-react";

const cards = [
  {
    icon: Lock,
    title: "Encrypted at Rest & in Transit",
    description: "AES-256 encryption on all stored contracts. HTTPS/TLS on all data in transit.",
  },
  {
    icon: Bot,
    title: "Never Used for AI Training",
    description: "Contracts processed via Anthropic Claude API. Your data is never used to train any AI model.",
  },
  {
    icon: User,
    title: "Your Data, Your Control",
    description: "Delete any contract instantly. Close your account and all data is gone within 24 hours.",
  },
  {
    icon: Ban,
    title: "Never Shared",
    description: "Your vendor names, pricing, and contract terms are never shared with any third party. Ever.",
  },
];

const TrustSection = () => {
  return (
    <section className="py-24 border-t border-border/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Your contracts stay private</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {cards.map((c) => (
            <div
              key={c.title}
              className="gradient-card rounded-2xl border border-border/50 p-6 text-center shadow-card"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold mb-2">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;

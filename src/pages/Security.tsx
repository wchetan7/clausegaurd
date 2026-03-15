import { Shield, Lock, Bot, User, Ban, Check, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const commitments = [
  "Never sell your contract data",
  "Never share data with third parties",
  "Never use contracts for AI training",
  "Never retain data after account deletion",
  "Never allow cross-user data access",
];

const Security = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header onStartTrial={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })} />

      <main className="pt-32 pb-20">
        {/* Hero */}
        <section className="text-center mb-24">
          <div className="container max-w-3xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Your contracts are private. Full stop.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              ContractOwl was built for founders who handle sensitive vendor agreements. We take data privacy seriously.
            </p>
          </div>
        </section>

        {/* Encryption & Storage */}
        <section className="py-16 border-t border-border/50">
          <div className="container max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-black">Bank-grade encryption, always on</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li>• All contracts encrypted at rest using AES-256</li>
              <li>• All data transmitted over HTTPS/TLS 1.2+</li>
              <li>• Stored on secure cloud infrastructure (AWS, US)</li>
              <li>• Each user's data is fully isolated — no cross-user access possible</li>
            </ul>
          </div>
        </section>

        {/* AI Processing */}
        <section className="py-16 border-t border-border/50">
          <div className="container max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-black">Your contracts never train AI models</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li>• ContractOwl uses the Anthropic Claude API to analyze contracts</li>
              <li>• Anthropic does not use API data for model training</li>
              <li>• Contract text is processed and discarded after analysis</li>
              <li>• Only extracted data points are stored (dates, costs, clauses) — not raw contract text</li>
            </ul>
          </div>
        </section>

        {/* Your Control */}
        <section id="delete" className="py-16 border-t border-border/50">
          <div className="container max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-black">You own your data. Completely.</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li>• Delete any contract instantly, permanently</li>
              <li>• Close your account and all data is removed within 24 hours</li>
              <li>• No data retained after deletion</li>
              <li>• No vendor names, pricing, or terms ever shared with third parties</li>
            </ul>
          </div>
        </section>

        {/* Commitments */}
        <section className="py-16 border-t border-border/50">
          <div className="container max-w-3xl">
            <h2 className="text-2xl font-black mb-8">What we never do</h2>
            <div className="space-y-4">
              {commitments.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 border-t border-border/50">
          <div className="container max-w-3xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black mb-3">Questions about your data?</h2>
            <p className="text-muted-foreground text-sm">
              Email us at{" "}
              <a href="mailto:privacy@contractowl.com" className="text-primary hover:underline">
                privacy@contractowl.com
              </a>{" "}
              and we'll respond within 24 hours.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Security;

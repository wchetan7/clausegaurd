import { ArrowRight, Lock, Ban, Bot, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  onStartTrial: () => void;
  onSignup?: () => void;
  onSampleScan?: () => void;
}

const trustItems = [
  { icon: Lock, label: "256-bit Encrypted" },
  { icon: Ban, label: "Never Sold or Shared" },
  { icon: Bot, label: "Not Used for AI Training" },
  { icon: Trash2, label: "Delete Anytime" },
];

const Hero = ({ onStartTrial }: HeroProps) => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container relative text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-4 animate-slide-up">
          Know What Your Vendors Are{" "}
          <span className="text-gradient">Actually Costing You</span>
        </h1>

        <p className="text-sm text-muted-foreground/60 mb-6 animate-slide-up" style={{ animationDelay: "0.05s" }}>
          Works with SaaS, service agreements, MSAs, and more.
        </p>

        <p className="text-sm text-muted-foreground mb-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          See your cancel-by dates, auto-renewal risks, and total vendor spend — instantly.
        </p>

        <div className="flex items-center justify-center animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <Button size="lg" className="text-base px-8 h-12 shadow-glow" onClick={onStartTrial}>
            Scan My First Contract Free — No Signup
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-4 mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          Upload a PDF. Get your risk report in 60 seconds. No account needed.
        </p>

        {/* Trust Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-0 mb-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          {trustItems.map((item, i) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground/70 px-3">
              <item.icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
              {i < trustItems.length - 1 && (
                <span className="hidden md:inline ml-3 text-border">|</span>
              )}
            </div>
          ))}
        </div>

        {/* Stat bar */}
        <div className="flex items-center justify-center gap-4 md:gap-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="text-center">
            <span className="text-xl md:text-2xl font-black text-primary">$2.4M+</span>
            <p className="text-xs text-muted-foreground">vendor spend tracked</p>
          </div>
          <span className="h-8 w-px bg-border" />
          <div className="text-center">
            <span className="text-xl md:text-2xl font-black text-primary">60 sec</span>
            <p className="text-xs text-muted-foreground">average scan time</p>
          </div>
          <span className="h-8 w-px bg-border" />
          <div className="text-center">
            <span className="text-xl md:text-2xl font-black text-primary">50+</span>
            <p className="text-xs text-muted-foreground">founders and ops teams</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

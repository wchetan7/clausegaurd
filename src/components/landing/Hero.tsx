import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  onStartTrial: () => void;
  onSignup?: () => void;
}

const Hero = ({ onStartTrial, onSignup }: HeroProps) => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      
      <div className="container relative text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8 animate-fade-in">
          Built for freelancers & small teams 🦉
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6 animate-slide-up">
          Most Contract Renewals Aren't{" "}
          <span className="text-gradient">Decisions. They're Defaults.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          ContractOwl flags every auto-renewal trap, hidden fee and cancellation deadline before the clock runs out.
        </p>
        
        <div className="flex items-center justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Button size="lg" className="text-base px-8 h-12 shadow-glow" onClick={onStartTrial}>
            Scan My Contract Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">Trusted by freelancers and consultants. No credit card required.</p>
      </div>
    </section>
  );
};

export default Hero;

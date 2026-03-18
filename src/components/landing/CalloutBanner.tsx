import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalloutBannerProps {
  onStartTrial: () => void;
}

const CalloutBanner = ({ onStartTrial }: CalloutBannerProps) => {
  return (
    <section className="py-20 bg-secondary/60 border-y border-border/50">
      <div className="container text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-4">
          The average founder has{" "}
          <span className="text-primary">$44,000+</span> in vendor spend
          auto-renewing every year without realizing it.
        </h2>
        <p className="text-muted-foreground text-base md:text-lg mb-8">
          ContractOwl shows you exactly where it is — before the invoice hits.
        </p>
        <Button size="lg" className="text-base px-8 h-12 shadow-glow" onClick={onStartTrial}>
          Scan My Contracts Free
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};

export default CalloutBanner;

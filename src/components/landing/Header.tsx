import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface HeaderProps {
  onStartTrial: () => void;
}

const Header = ({ onStartTrial }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo-owl.png" alt="ContractOwl" className="h-7 w-7" />
          <span className="text-xl font-bold tracking-tight text-foreground">ContractOwl</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <Link to="/security" className="hover:text-foreground transition-colors">Security</Link>
        </nav>
        <Button onClick={onStartTrial} size="sm">
          Start Free Trial
        </Button>
      </div>
    </header>
  );
};

export default Header;

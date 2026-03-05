import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo-owl.png" alt="ContractOwl" className="h-5 w-5" />
            <span className="font-bold">ContractOwl</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <a href="#" className="hover:text-foreground transition-colors">Support</a>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 ContractOwl. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

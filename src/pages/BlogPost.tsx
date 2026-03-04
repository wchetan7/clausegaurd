import { Link } from "react-router-dom";
import { Shield, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Footer from "@/components/landing/Footer";

const dangerousClauses = [
  "Auto-renewal clauses",
  "Price escalation terms",
  "Early termination fees",
  "Liability limitations",
  "IP ownership transfers",
];

const steps = [
  {
    num: "01",
    title: "Upload Your Contract",
    desc: "Drag and drop your PDF or DOCX file. We support all standard contract formats.",
  },
  {
    num: "02",
    title: "AI Scans in 60 Seconds",
    desc: "Powered by Claude AI, ClauseGuard reads every clause — identifying risks, auto-renewals, and hidden fees.",
  },
  {
    num: "03",
    title: "Get Your Risk Report",
    desc: "Receive a colour-coded risk report: RED for high risk, YELLOW for medium risk, GREEN for low risk.",
  },
  {
    num: "04",
    title: "Set Renewal Reminders",
    desc: "Get email alerts at 90, 60, and 30 days before renewal deadlines — never miss a cancellation window again.",
  },
];

const BlogPost = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">ClauseGuard</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link to="/#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
            <Link to="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </nav>
        </div>
      </header>

      <main className="pt-32 pb-24">
        <article className="container max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <div className="mb-4 text-xs text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · 5 min read
          </div>

          <h1 className="text-3xl md:text-4xl font-black mb-8 leading-tight">
            How ClauseGuard Protects Small Businesses from Bad Contracts
          </h1>

          {/* Intro */}
          <p className="text-muted-foreground leading-relaxed text-lg mb-8">
            You finally land a new vendor. The contract arrives — 14 pages of dense legal text. You skim it, sign it, and move on. Six months later, you get a surprise invoice. Turns out there was an auto-renewal clause on page 11. You missed the 60-day cancellation window. You're locked in for another year.
          </p>
          <p className="text-primary font-bold text-xl mb-12">That's why we built ClauseGuard.</p>

          {/* What is ClauseGuard */}
          <h2 className="text-2xl font-bold mb-4">What is ClauseGuard?</h2>
          <p className="text-muted-foreground leading-relaxed mb-12">
            ClauseGuard is an AI-powered contract scanner built for small businesses. Upload a vendor contract and get a detailed risk report in 60 seconds. No legal jargon, no hourly billing — just clear, actionable insights.
          </p>

          {/* The Problem */}
          <h2 className="text-2xl font-bold mb-4">The Problem</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            SMBs sign 10–20 vendor contracts per year. Most don't have legal teams. The most dangerous clauses hide in plain sight:
          </p>
          <ul className="space-y-3 mb-12">
            {dangerousClauses.map((clause) => (
              <li key={clause} className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 px-4 py-3 text-foreground font-medium">
                <span className="h-2 w-2 rounded-full bg-destructive shrink-0" />
                {clause}
              </li>
            ))}
          </ul>

          {/* How It Works */}
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          <div className="grid gap-4 mb-12">
            {steps.map((s) => (
              <div key={s.num} className="gradient-card rounded-xl border border-border/50 p-6 hover:border-primary/40 transition-colors shadow-card">
                <div className="flex items-start gap-4">
                  <span className="font-mono text-primary/60 text-sm mt-1 shrink-0">{s.num}</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard */}
          <h2 className="text-2xl font-bold mb-4">Your Contract Dashboard</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Track everything from a single dashboard — total contracts uploaded, contracts expiring soon, high-risk contracts that need attention, and total MRR at risk from auto-renewals.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            {["Total Contracts", "Expiring Soon", "High Risk", "MRR at Risk"].map((label) => (
              <div key={label} className="rounded-lg border border-border/50 bg-secondary/30 p-4 text-center">
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>

          {/* What ClauseGuard is NOT */}
          <h2 className="text-2xl font-bold mb-4">What ClauseGuard is NOT</h2>
          <Alert variant="destructive" className="mb-12 border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="text-sm leading-relaxed">
              <strong>ClauseGuard is not a law firm.</strong> It does not provide legal advice. It is your first line of defence — not a substitute for a qualified lawyer on high-value contracts.
            </AlertDescription>
          </Alert>

          {/* Built for India */}
          <h2 className="text-2xl font-bold mb-4">Built for Indian Small Businesses</h2>
          <p className="text-muted-foreground leading-relaxed mb-12">
            There are 63 million SMBs in India — and almost none of them have access to a legal team. ClauseGuard levels the playing field, giving every small business owner the power to understand what they're signing before they sign it.
          </p>

          {/* CTA */}
          <div className="text-center gradient-card rounded-2xl border border-border/50 p-10 shadow-card mb-12">
            <h3 className="text-2xl font-bold mb-3">Ready to protect your business?</h3>
            <p className="text-muted-foreground mb-6">Upload your first contract and get a risk report in 60 seconds.</p>
            <Button asChild size="lg" className="shadow-glow">
              <Link to="/">Start Your Free Trial</Link>
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            ClauseGuard is an AI-powered tool. It does not provide legal advice. Always consult a qualified lawyer before signing contracts.
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;

import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/landing/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 py-4">
        <div className="container flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo-owl.png" alt="ContractOwl" className="h-6 w-6" />
            <span className="text-xl font-bold">ContractOwl</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 container max-w-3xl py-12 space-y-8">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: March 4, 2026</p>

        <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-6 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-bold text-destructive">Important Disclaimer</h2>
          </div>
          <p className="text-sm font-medium text-destructive">
            ContractOwl is NOT legal advice. Our AI-powered analysis is intended to assist with contract review but does not replace professional legal counsel. You should always consult a qualified lawyer before signing any contract. ContractOwl and its operators accept no liability for decisions made based on our analysis.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing or using ContractOwl, you agree to be bound by these Terms of Service. If you do not agree, you may not use the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Description of Service</h2>
          <p className="text-muted-foreground">
            ContractOwl provides AI-powered contract analysis, clause extraction, risk scoring, and renewal reminders. The service is provided "as is" and we make no guarantees about the accuracy or completeness of our analysis.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">User Responsibilities</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Ensure you have the right to upload contracts for analysis</li>
            <li>Do not use the service for any unlawful purpose</li>
            <li>Do not attempt to reverse-engineer or exploit the service</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Subscription & Billing</h2>
          <p className="text-muted-foreground">
            Paid plans are billed monthly or annually. You may cancel at any time, and your access will continue until the end of your current billing period. Refunds are not provided for partial billing periods.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Limitation of Liability</h2>
          <p className="text-muted-foreground">
            To the maximum extent permitted by law, ContractOwl shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service, including but not limited to losses from contract decisions made based on our analysis.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="text-muted-foreground">
            Questions about these terms? Contact us at{" "}
            <a href="mailto:legal@contractowl.com" className="text-primary hover:underline">
              legal@contractowl.com
            </a>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;

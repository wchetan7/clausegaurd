import { Link } from "react-router-dom";
import Footer from "@/components/landing/Footer";

const PrivacyPolicy = () => {
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
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: March 4, 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What Data We Collect</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Account information: email address, hashed password</li>
            <li>Contract documents you upload for analysis</li>
            <li>Analysis results, clauses, and risk assessments</li>
            <li>Usage data: pages visited, features used, timestamps</li>
            <li>Payment information processed securely via Stripe</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How We Use Your Data</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>To provide AI-powered contract analysis and risk scoring</li>
            <li>To send renewal reminders and notifications you've configured</li>
            <li>To improve our analysis accuracy and product features</li>
            <li>To process payments and manage your subscription</li>
            <li>To communicate important service updates</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Third-Party Services</h2>
          <p className="text-muted-foreground">We share data with the following third-party providers to deliver our services:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong className="text-foreground">Anthropic</strong> — Powers our AI contract analysis engine</li>
            <li><strong className="text-foreground">Lovable</strong> — Application hosting and infrastructure</li>
            <li><strong className="text-foreground">n8n</strong> — Workflow automation for reminders and notifications</li>
            <li><strong className="text-foreground">Stripe</strong> — Secure payment processing</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Your Rights</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Access, correct, or delete your personal data at any time</li>
            <li>Export your contract data in standard formats</li>
            <li>Opt out of non-essential communications</li>
            <li>Request deletion of your account and all associated data</li>
            <li>Lodge a complaint with your local data protection authority</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Contact Us</h2>
          <p className="text-muted-foreground">
            For any privacy-related questions or requests, contact us at{" "}
            <a href="mailto:privacy@contractowl.com" className="text-primary hover:underline">
              privacy@contractowl.com
            </a>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

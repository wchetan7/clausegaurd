import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "@/components/landing/Header";
import { sampleAnalysis } from "@/components/landing/DemoSection";
import Hero from "@/components/landing/Hero";
import MetricsBar from "@/components/landing/MetricsBar";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import CalloutBanner from "@/components/landing/CalloutBanner";
import PainSection from "@/components/landing/PainSection";
import DemoSection from "@/components/landing/DemoSection";
import TrustSection from "@/components/landing/TrustSection";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import AuthModal from "@/components/AuthModal";
import GuestUploadModal from "@/components/GuestUploadModal";
import FreeScanLimitModal from "@/components/FreeScanLimitModal";
import { getGuestScanCount } from "@/components/GuestUploadModal";

const Index = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [guestUploadOpen, setGuestUploadOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const navigate = useNavigate();

  const handleScanClick = () => {
    if (getGuestScanCount() >= 5) {
      setLimitOpen(true);
    } else {
      setGuestUploadOpen(true);
    }
  };

  const handleSignupClick = () => {
    (window as any).posthog?.capture("signup_clicked");
    setAuthMode("signup");
    setAuthOpen(true);
  };

  const handleGuestResult = (analysis: any, contractName: string) => {
    (window as any).posthog?.capture("guest_scan_completed", { contractName });
    navigate("/guest-report", { state: { analysis, contractName } });
  };

  const handleSignIn = () => {
    setAuthMode("signin");
    setAuthOpen(true);
  };

  const handleSeePricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSampleScan = () => {
    (window as any).posthog?.capture("sample_scan_clicked");
    navigate("/guest-report", { state: { analysis: sampleAnalysis, contractName: "CloudBase Software Agreement" } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onStartTrial={handleSignupClick} />
      <main>
        <Hero onStartTrial={handleScanClick} onSignup={handleSignupClick} />
        <MetricsBar />
        <HowItWorks />
        <Features />
        <PainSection />
        <DemoSection onStartTrial={handleScanClick} onSignup={handleSignupClick} onSampleScan={handleSampleScan} />
        <TrustSection />
        <Pricing onStartTrial={handleScanClick} />
        <FAQ />
      </main>
      <Footer />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />
      <GuestUploadModal open={guestUploadOpen} onOpenChange={setGuestUploadOpen} onResult={handleGuestResult} onSignIn={handleSignIn} />
      <FreeScanLimitModal open={limitOpen} onOpenChange={setLimitOpen} onSeePricing={handleSeePricing} onEmailSignup={handleSignupClick} />
    </div>
  );
};

export default Index;

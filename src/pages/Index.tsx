import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import DemoSection from "@/components/landing/DemoSection";
import SocialProof from "@/components/landing/SocialProof";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
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
    if (getGuestScanCount() >= 3) {
      setLimitOpen(true);
    } else {
      setGuestUploadOpen(true);
    }
  };

  const handleGuestResult = (analysis: any, contractName: string) => {
    navigate("/guest-report", { state: { analysis, contractName } });
  };

  const handleSignIn = () => {
    setAuthMode("signin");
    setAuthOpen(true);
  };

  const handleSeePricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onStartTrial={handleScanClick} />
      <main>
        <Hero onStartTrial={handleScanClick} />
        <DemoSection onStartTrial={handleScanClick} />
        <SocialProof />
        <HowItWorks />
        <Pricing onStartTrial={handleScanClick} />
      </main>
      <Footer />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <GuestUploadModal open={guestUploadOpen} onOpenChange={setGuestUploadOpen} onResult={handleGuestResult} onSignIn={handleSignIn} />
      <FreeScanLimitModal open={limitOpen} onOpenChange={setLimitOpen} onSeePricing={handleSeePricing} />
    </div>
  );
};

export default Index;

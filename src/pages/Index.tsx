import { useState } from "react";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import AuthModal from "@/components/AuthModal";

const Index = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onStartTrial={() => setAuthOpen(true)} />
      <main>
        <Hero onStartTrial={() => setAuthOpen(true)} />
        <HowItWorks />
        <Pricing onStartTrial={() => setAuthOpen(true)} />
      </main>
      <Footer />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default Index;

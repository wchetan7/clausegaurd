import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2, X } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StickyConversionBar from "@/components/guest-report/StickyConversionBar";
import SavePromptModal from "@/components/guest-report/SavePromptModal";
import PostSignupSuccess from "@/components/guest-report/PostSignupSuccess";

const PENDING_CONTRACT_KEY = "contractowl_pending_contract";

export function getPendingContract() {
  try {
    const raw = sessionStorage.getItem(PENDING_CONTRACT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPendingContract() {
  sessionStorage.removeItem(PENDING_CONTRACT_KEY);
}

const severityConfig: Record<string, { color: string; icon: typeof AlertTriangle }> = {
  HIGH: { color: "destructive", icon: AlertTriangle },
  MEDIUM: { color: "secondary", icon: Shield },
  LOW: { color: "outline", icon: CheckCircle2 },
};

const GuestReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { analysis, contractName } = (location.state as any) || {};

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savePromptOpen, setSavePromptOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [userName, setUserName] = useState("");

  // Derive cancel-by date from analysis
  const cancelByDate = analysis?.cancellation_deadline || analysis?.renewal_date || analysis?.expiry_date || null;

  // Save contract data to sessionStorage so it persists through auth
  useEffect(() => {
    if (analysis && contractName) {
      sessionStorage.setItem(
        PENDING_CONTRACT_KEY,
        JSON.stringify({ contractName, analysis, savedAt: new Date().toISOString() })
      );
    }
  }, [analysis, contractName]);

  // Listen for auth state changes — auto-save pending contract + create reminders
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user && !saved) {
        const pending = getPendingContract();
        if (pending) {
          try {
            const userId = session.user.id;
            setUserName(session.user.email || "");

            // Insert contract
            const { data: contract, error: contractError } = await supabase
              .from("contracts")
              .insert({
                user_id: userId,
                name: pending.contractName || "Untitled Contract",
                vendor: pending.analysis?.vendor || pending.contractName || "Unknown Vendor",
                risk_score: pending.analysis?.risk_score || "Low",
                status: "Reviewed",
                contract_value: pending.analysis?.contract_value || 0,
                auto_renewal: pending.analysis?.auto_renewal || false,
                renewal_date: pending.analysis?.renewal_date || null,
                notice_period_days: pending.analysis?.notice_period_days || null,
                cancellation_deadline: pending.analysis?.cancellation_deadline || null,
                expiry_date: pending.analysis?.expiry_date || null,
              })
              .select("id")
              .single();

            if (contractError) throw contractError;

            // Insert clauses
            if (contract && pending.analysis?.clauses?.length) {
              const clauseRows = pending.analysis.clauses.map((c: any) => ({
                contract_id: contract.id,
                clause_type: c.clause_type,
                severity: c.severity || "LOW",
                summary: c.summary,
                raw_text: c.raw_text,
                action_required: c.action_required || null,
              }));
              await supabase.from("contract_clauses").insert(clauseRows);
            }

            // Auto-create reminders at 90, 60, 30 days before cancel-by date
            const cbDate = pending.analysis?.cancellation_deadline || pending.analysis?.expiry_date || pending.analysis?.renewal_date;
            if (contract && cbDate) {
              const target = new Date(cbDate);
              const reminderDays = [90, 60, 30];
              const reminderRows = reminderDays
                .map((days) => {
                  const d = new Date(target);
                  d.setDate(d.getDate() - days);
                  return d > new Date() ? {
                    user_id: userId,
                    contract_id: contract.id,
                    reminder_date: d.toISOString().split("T")[0],
                    type: "cancellation_deadline",
                  } : null;
                })
                .filter(Boolean);
              if (reminderRows.length > 0) {
                await supabase.from("reminders").insert(reminderRows as any);
              }
            }

            clearPendingContract();
            setSaved(true);
            setSuccessOpen(true);
            setSavePromptOpen(false);
            toast({ title: "✅ Contract saved to your account", description: "3 reminders set before your cancel-by date." });
          } catch (err: any) {
            console.error("Failed to save pending contract:", err);
            toast({ title: "Couldn't auto-save contract", description: err.message, variant: "destructive" });
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [saved, toast]);

  useEffect(() => {
    if (!analysis) {
      navigate("/", { replace: true });
    }
  }, [analysis, navigate]);

  if (!analysis) return null;

  const riskColor = analysis.risk_score === "High" ? "text-destructive" : analysis.risk_score === "Medium" ? "text-warning" : "text-primary";

  const openAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleStickyClick = () => {
    setSavePromptOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <img src="/logo-owl.png" alt="ContractOwl" className="h-6 w-6" />
            <span className="font-bold">ContractOwl</span>
          </div>
        </div>
      </header>

      {/* Sticky save banner */}
      {!bannerDismissed && !saved && (
        <div className="sticky top-0 z-40 bg-primary/10 border-b border-primary/20 backdrop-blur-md">
          <div className="container flex items-center justify-between py-3 gap-4">
            <p className="text-sm font-medium text-foreground">
              💾 Save your results — Sign up free to track this contract and all future renewals
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" onClick={() => setSavePromptOpen(true)}>Sign Up Free</Button>
              <button onClick={() => setBannerDismissed(true)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {saved && (
        <div className="sticky top-0 z-40 bg-primary/10 border-b border-primary/20 backdrop-blur-md">
          <div className="container flex items-center gap-3 py-3">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-foreground">Contract saved to your account!</p>
            <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")} className="ml-auto">Go to Dashboard</Button>
          </div>
        </div>
      )}

      <main className="container max-w-4xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">{contractName}</h1>
            <p className="text-sm text-muted-foreground">Free scan report</p>
          </div>
          <div className={`text-2xl font-black ${riskColor}`}>{analysis.risk_score} Risk</div>
        </div>

        <div className="grid gap-4">
          {analysis.clauses?.map((clause: any, i: number) => {
            const config = severityConfig[clause.severity] || severityConfig.LOW;
            return (
              <Card key={i} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold capitalize">
                      {clause.clause_type.replace(/_/g, " ")}
                    </CardTitle>
                    <Badge variant={config.color as any}>{clause.severity}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-foreground">{clause.summary}</p>
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground font-mono leading-relaxed">"{clause.raw_text}"</p>
                  </div>
                  {clause.action_required && (
                    <p className="text-xs text-primary font-medium">⚡ {clause.action_required}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA card */}
        {!saved && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6 text-center space-y-3">
              <h3 className="font-bold text-lg">Want to save reports & get renewal reminders?</h3>
              <p className="text-sm text-muted-foreground">Sign up to track contracts, get email alerts, and export PDF reports.</p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={() => setSavePromptOpen(true)} size="lg">Save My Contract — Free →</Button>
                <Button onClick={() => openAuth("signin")} variant="outline" size="lg">Sign In</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Sticky bottom conversion bar */}
      {!saved && <StickyConversionBar cancelByDate={cancelByDate} onSaveClick={handleStickyClick} />}

      {/* Save prompt modal */}
      <SavePromptModal
        open={savePromptOpen}
        onOpenChange={setSavePromptOpen}
        onSignInClick={() => { setSavePromptOpen(false); openAuth("signin"); }}
        onSignupComplete={() => {}}
      />

      {/* Post-signup success */}
      <PostSignupSuccess
        open={successOpen}
        onOpenChange={setSuccessOpen}
        contractName={contractName || ""}
        cancelByDate={cancelByDate}
        riskScore={analysis?.risk_score}
        userName={userName}
      />

      {/* Fallback auth modal */}
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />
    </div>
  );
};

export default GuestReport;

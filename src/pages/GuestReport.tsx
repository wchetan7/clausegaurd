import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

const severityConfig: Record<string, { color: string; icon: typeof AlertTriangle }> = {
  HIGH: { color: "destructive", icon: AlertTriangle },
  MEDIUM: { color: "secondary", icon: Shield },
  LOW: { color: "outline", icon: CheckCircle2 },
};

const GuestReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysis, contractName } = (location.state as any) || {};

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No report data found.</p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const riskColor = analysis.risk_score === "High" ? "text-destructive" : analysis.risk_score === "Medium" ? "text-yellow-500" : "text-green-500";

  return (
    <div className="min-h-screen bg-background">
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

      <main className="container max-w-4xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">{contractName}</h1>
            <p className="text-sm text-muted-foreground">Free scan report</p>
          </div>
          <div className={`text-2xl font-black ${riskColor}`}>
            {analysis.risk_score} Risk
          </div>
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

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-6 text-center space-y-3">
            <h3 className="font-bold text-lg">Want to save reports & get renewal reminders?</h3>
            <p className="text-sm text-muted-foreground">Sign up to track contracts, get email alerts, and export PDF reports.</p>
            <Button onClick={() => navigate("/")} size="lg">
              Sign Up Free →
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default GuestReport;

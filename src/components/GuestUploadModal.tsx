import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle, Shield, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isLikelyContract, NOT_A_CONTRACT_MSG } from "@/lib/validateContract";
import { isAcceptedFile, extractFileText } from "@/lib/extractText";

const GUEST_SCAN_KEY = "contractowl_guest_scans";

export function getGuestScanCount(): number {
  try {
    return parseInt(localStorage.getItem(GUEST_SCAN_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

export function incrementGuestScanCount(): void {
  try {
    localStorage.setItem(GUEST_SCAN_KEY, String(getGuestScanCount() + 1));
  } catch {}
}

const GuestUploadModal = ({ open, onOpenChange, onResult, onSignIn }: GuestUploadModalProps) => {
  const [stage, setStage] = useState<Stage>("form");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const reset = () => {
    setStage("form");
    setName("");
    setFile(null);
    setErrorMsg("");
    setAnalysis(null);
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setFile(f);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: "Please select a PDF file", variant: "destructive" });
      return;
    }

    try {
      setStage("extracting");
      const pdfText = await extractPdfText(file);

      if (!pdfText.trim()) {
        throw new Error("Could not extract text from PDF. The file may be image-based.");
      }

      if (!isLikelyContract(pdfText)) {
        throw new Error(NOT_A_CONTRACT_MSG);
      }

      setStage("analyzing");
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://uldnipuxguytidmgxwhi.supabase.co";
      const resp = await fetch(`${supabaseUrl}/functions/v1/analyze-contract-guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdf_text: pdfText }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Analysis failed");
      }

      const data = await resp.json();
      setAnalysis(data.analysis);
      incrementGuestScanCount();
      setStage("success");
    } catch (err: any) {
      console.error("Guest scan error:", err);
      setErrorMsg(err.message || "Something went wrong");
      setStage("error");
    }
  };

  const stageLabels: Record<string, string> = {
    extracting: "Extracting text from PDF...",
    analyzing: "AI is analyzing your contract...",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        {stage === "form" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-5 w-5 text-primary" />
                <DialogTitle className="text-xl font-bold">Scan Your Contract</DialogTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a PDF and get a free risk analysis in seconds. No signup needed.
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onClick={() => document.getElementById("guest-file-input")?.click()}
              >
                <input
                  id="guest-file-input"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop PDF or{" "}
                      <span className="text-primary font-medium">browse</span>
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label>Contract Name (optional)</Label>
                <Input placeholder="e.g. Annual SaaS License" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <Button type="submit" className="w-full" size="lg">
                <Upload className="mr-2 h-4 w-4" />
                Scan Contract Free
              </Button>

              {onSignIn && (
                <button
                  type="button"
                  onClick={() => { handleClose(false); onSignIn(); }}
                  className="w-full text-xs text-center text-primary hover:underline transition-colors"
                >
                  Sign in for unlimited scans →
                </button>
              )}

              <p className="text-xs text-center text-muted-foreground">
                Your document is processed securely and never stored.
              </p>
            </form>

            {onSignIn && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Already have an account?{" "}
                <button
                  onClick={() => { handleClose(false); onSignIn(); }}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in →
                </button>
              </p>
            )}
          </>
        )}

        {(stage === "extracting" || stage === "analyzing") && (
          <div className="py-16 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-6 animate-spin" />
            <h3 className="text-lg font-bold mb-2">{stageLabels[stage]}</h3>
            <p className="text-sm text-muted-foreground">
              {stage === "analyzing"
                ? "Scanning for risks, renewals, and hidden clauses"
                : "This will only take a moment"}
            </p>
            <div className="flex justify-center gap-2 mt-6">
              {["extracting", "analyzing"].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-12 rounded-full transition-colors ${
                    ["extracting", "analyzing"].indexOf(stage) >= ["extracting", "analyzing"].indexOf(s)
                      ? "bg-primary"
                      : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {stage === "success" && analysis && (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Analysis Complete!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Found {analysis.clauses?.length || 0} clauses · Risk: {analysis.risk_score}
            </p>
            <Button
              onClick={() => {
                onResult(analysis, name || file?.name || "Contract");
                handleClose(false);
              }}
              size="lg"
            >
              View Full Report <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {stage === "error" && (
          <div className="py-16 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-6" />
            <h3 className="text-lg font-bold mb-2">Analysis Failed</h3>
            <p className="text-sm text-muted-foreground mb-6">{errorMsg}</p>
            <Button onClick={reset}>Try Again</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GuestUploadModal;

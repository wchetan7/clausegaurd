import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

type Stage = "form" | "uploading" | "extracting" | "analyzing" | "success" | "error";

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item: any) => item.str).join(" "));
  }
  return pages.join("\n\n");
}

const UploadModal = ({ open, onOpenChange, userId, onSuccess }: UploadModalProps) => {
  const [stage, setStage] = useState<Stage>("form");
  const [name, setName] = useState("");
  const [vendor, setVendor] = useState("");
  const [value, setValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [contractId, setContractId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const reset = () => {
    setStage("form");
    setName("");
    setVendor("");
    setValue("");
    setFile(null);
    setContractId(null);
    setErrorMsg("");
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
      // Step 1: Create contract record
      setStage("uploading");
      const { data: inserted, error: insertErr } = await supabase.from("contracts").insert({
        user_id: userId,
        name,
        vendor,
        contract_value: parseFloat(value) || 0,
        status: "Scanning",
      }).select("id").single();

      if (insertErr || !inserted) throw new Error(insertErr?.message || "Failed to create contract");
      setContractId(inserted.id);

      // Step 2: Extract PDF text
      setStage("extracting");
      const pdfText = await extractPdfText(file);

      if (!pdfText.trim()) {
        throw new Error("Could not extract text from PDF. The file may be image-based.");
      }

      // Step 3: Call AI analysis
      setStage("analyzing");
      const { data: session } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-contract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.session?.access_token}`,
        },
        body: JSON.stringify({ contract_id: inserted.id, pdf_text: pdfText }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Analysis failed");
      }

      setStage("success");
      onSuccess();
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg(err.message || "Something went wrong");
      setStage("error");
    }
  };

  const handleRetry = () => {
    // If we have a contract ID, delete the failed record and retry
    if (contractId) {
      supabase.from("contracts").delete().eq("id", contractId).then(() => {
        reset();
      });
    } else {
      reset();
    }
  };

  const stageLabels: Record<string, string> = {
    uploading: "Creating contract record...",
    extracting: "Extracting text from PDF...",
    analyzing: "AI is analyzing your contract...",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        {stage === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Upload Contract</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
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
                <Label>Contract Name</Label>
                <Input placeholder="e.g. Annual SaaS License" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Vendor Name</Label>
                <Input placeholder="e.g. Acme Corp" value={vendor} onChange={(e) => setVendor(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Contract Value ($/year)</Label>
                <Input type="number" placeholder="e.g. 12000" value={value} onChange={(e) => setValue(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Scan Contract
              </Button>
            </form>
          </>
        )}

        {(stage === "uploading" || stage === "extracting" || stage === "analyzing") && (
          <div className="py-16 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-6 animate-spin" />
            <h3 className="text-lg font-bold mb-2">{stageLabels[stage]}</h3>
            <p className="text-sm text-muted-foreground">
              {stage === "analyzing"
                ? "Scanning for risks, renewals, and hidden clauses"
                : "This will only take a moment"}
            </p>
            <div className="flex justify-center gap-2 mt-6">
              {["uploading", "extracting", "analyzing"].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    ["uploading", "extracting", "analyzing"].indexOf(stage) >=
                    ["uploading", "extracting", "analyzing"].indexOf(s)
                      ? "bg-primary"
                      : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {stage === "success" && (
          <div className="py-16 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-6" />
            <h3 className="text-lg font-bold mb-2">Contract Analyzed!</h3>
            <p className="text-sm text-muted-foreground mb-6">Your risk report is ready to view.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => handleClose(false)}>View Dashboard</Button>
              {contractId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleClose(false);
                    navigate(`/contract/${contractId}`);
                  }}
                >
                  View Report
                </Button>
              )}
            </div>
          </div>
        )}

        {stage === "error" && (
          <div className="py-16 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-6" />
            <h3 className="text-lg font-bold mb-2">Analysis Failed</h3>
            <p className="text-sm text-muted-foreground mb-6">{errorMsg}</p>
            <Button onClick={handleRetry}>Try Again</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;

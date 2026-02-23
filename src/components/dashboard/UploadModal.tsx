import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

type Stage = "form" | "scanning" | "success";

const UploadModal = ({ open, onOpenChange, userId, onSuccess }: UploadModalProps) => {
  const [stage, setStage] = useState<Stage>("form");
  const [name, setName] = useState("");
  const [vendor, setVendor] = useState("");
  const [value, setValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const reset = () => {
    setStage("form");
    setName("");
    setVendor("");
    setValue("");
    setFile(null);
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
    setStage("scanning");

    // Simulate AI scan for 3 seconds
    await new Promise((r) => setTimeout(r, 3000));

    const riskScores = ["Low", "Medium", "High"] as const;
    const randomRisk = riskScores[Math.floor(Math.random() * 3)];
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + Math.floor(Math.random() * 12) + 1);

    const { error } = await supabase.from("contracts").insert({
      user_id: userId,
      name,
      vendor,
      contract_value: parseFloat(value) || 0,
      risk_score: randomRisk,
      status: "Reviewed",
      renewal_date: renewalDate.toISOString().split("T")[0],
    });

    if (error) {
      toast({ title: "Error saving contract", description: error.message, variant: "destructive" });
      setStage("form");
      return;
    }

    setStage("success");
    onSuccess();
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
              {/* Drop zone */}
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

        {stage === "scanning" && (
          <div className="py-16 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-6 animate-spin" />
            <h3 className="text-lg font-bold mb-2">AI is analyzing your contract...</h3>
            <p className="text-sm text-muted-foreground">Scanning for risks, renewals, and hidden clauses</p>
          </div>
        )}

        {stage === "success" && (
          <div className="py-16 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-6" />
            <h3 className="text-lg font-bold mb-2">Contract Analyzed!</h3>
            <p className="text-sm text-muted-foreground mb-6">Your risk report is ready to view.</p>
            <Button onClick={() => handleClose(false)}>View Dashboard</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;

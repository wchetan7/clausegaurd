import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, AlertTriangle, Shield } from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";

interface PostSignupSuccessProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractName: string;
  cancelByDate?: string | null;
  riskScore?: string;
  userName?: string;
}

const PostSignupSuccess = ({
  open,
  onOpenChange,
  contractName,
  cancelByDate,
  riskScore,
  userName,
}: PostSignupSuccessProps) => {
  const navigate = useNavigate();

  const daysRemaining = cancelByDate
    ? differenceInDays(parseISO(cancelByDate), new Date())
    : null;

  const formattedDate = cancelByDate
    ? format(parseISO(cancelByDate), "MMM d, yyyy")
    : null;

  const riskColor =
    riskScore === "High" ? "text-destructive" : riskScore === "Medium" ? "text-warning" : "text-primary";

  const firstName = userName?.split(" ")[0] || userName?.split("@")[0] || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border text-center">
        <div className="py-4 space-y-5">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in-50 duration-500">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>

          <div>
            <h2 className="text-xl font-black">
              You're all set{firstName ? `, ${firstName}` : ""}!
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              We've saved your contract and set 3 reminders before your cancel-by date. You'll never miss a renewal window.
            </p>
          </div>

          {/* Contract summary card */}
          <div className="bg-secondary/50 rounded-xl p-4 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Contract</span>
              <span className="text-sm font-bold">{contractName}</span>
            </div>
            {formattedDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Cancel-by
                </span>
                <span className="text-sm font-bold">{formattedDate}</span>
              </div>
            )}
            {daysRemaining !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Days remaining
                </span>
                <span className={`text-sm font-black ${daysRemaining <= 30 ? "text-destructive" : daysRemaining <= 60 ? "text-warning" : "text-primary"}`}>
                  {daysRemaining > 0 ? daysRemaining : "Past due"}
                </span>
              </div>
            )}
            {riskScore && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Risk level
                </span>
                <span className={`text-sm font-black ${riskColor}`}>{riskScore}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => { onOpenChange(false); navigate("/dashboard"); }}
              className="w-full font-bold"
              size="lg"
            >
              Go to My Dashboard →
            </Button>
            <Button
              onClick={() => { onOpenChange(false); navigate("/"); }}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Scan Another Contract
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostSignupSuccess;

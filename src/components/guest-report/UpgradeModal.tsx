import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, Calendar, AlertTriangle } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalContracts: number;
  totalSpend: number;
  upcomingRenewals: number;
  mrrAtRisk: number;
}

const UpgradeModal = ({
  open,
  onOpenChange,
  totalContracts,
  totalSpend,
  upcomingRenewals,
  mrrAtRisk,
}: UpgradeModalProps) => {
  const stats = [
    { icon: FileText, label: "Contracts scanned", value: totalContracts },
    { icon: DollarSign, label: "Vendor spend tracked", value: `$${totalSpend.toLocaleString()}/yr` },
    { icon: Calendar, label: "Upcoming renewals", value: upcomingRenewals },
    { icon: AlertTriangle, label: "MRR at risk", value: `$${mrrAtRisk.toLocaleString()}` },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-center">
            You've tracked {totalContracts} contracts
            <br />
            <span className="text-primary">(${totalSpend.toLocaleString()}/yr in vendor spend)</span>
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground text-center">
          Upgrade to Pro to track unlimited contracts, see your full vendor spend dashboard, and get AI-generated cancellation letters and negotiation emails.
        </p>

        <div className="bg-secondary/50 rounded-xl p-4 space-y-3 my-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Icon className="h-4 w-4" /> {label}
              </span>
              <span className="text-sm font-bold">{value}</span>
            </div>
          ))}
        </div>

        <div className="text-center space-y-1">
          <p className="text-lg font-black">Pro — $59/month</p>
          <p className="text-xs text-muted-foreground">
            Cancel anytime. No auto-renewal without your approval — we know how that feels. 😄
          </p>
        </div>

        <div className="space-y-2 mt-2">
          <Button className="w-full font-bold" size="lg">
            Upgrade to Pro →
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";

interface StickyConversionBarProps {
  cancelByDate?: string | null;
  onSaveClick: () => void;
}

const StickyConversionBar = ({ cancelByDate, onSaveClick }: StickyConversionBarProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const daysRemaining = cancelByDate
    ? differenceInDays(parseISO(cancelByDate), new Date())
    : null;

  const formattedDate = cancelByDate
    ? format(parseISO(cancelByDate), "MMM d, yyyy")
    : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary border-t border-primary/80 animate-in slide-in-from-bottom-4 duration-500">
      <div className="container flex items-center justify-between py-3 gap-4">
        <div className="flex items-center gap-2 text-primary-foreground min-w-0">
          <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse" />
          <p className="text-sm font-semibold truncate">
            {formattedDate && daysRemaining !== null ? (
              <>
                ⚠️ Cancel-by date: {formattedDate}.{" "}
                <span className="font-black">
                  {daysRemaining > 0 ? `${daysRemaining} days to act.` : "Deadline passed!"}
                </span>
              </>
            ) : (
              "⚠️ Don't lose your risk report — save it now."
            )}
          </p>
        </div>
        <Button
          onClick={onSaveClick}
          size="sm"
          variant="secondary"
          className="shrink-0 font-bold animate-pulse"
        >
          Save & Get Reminded — Free →
        </Button>
      </div>
    </div>
  );
};

export default StickyConversionBar;

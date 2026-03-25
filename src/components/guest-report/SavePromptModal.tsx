import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Bell, Shield, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";

interface SavePromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignInClick: () => void;
  onSignupComplete: () => void;
}

const benefits = [
  { icon: Bell, text: "Cancel-by date reminder via email" },
  { icon: FileText, text: "Full risk report saved to dashboard" },
  { icon: Shield, text: "Track up to 3 contracts free" },
];

const SavePromptModal = ({ open, onOpenChange, onSignInClick, onSignupComplete }: SavePromptModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      toast({ title: "Check your email", description: "We sent you a confirmation link." });
      onSignupComplete();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setGoogleLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-center">
            Don't miss your cancel-by date
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground text-center">
          We'll remind you 90, 60, and 30 days before your vendor contract auto-renews. Free forever.
        </p>

        <div className="space-y-2 my-4">
          {benefits.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm text-foreground">{text}</span>
            </div>
          ))}
        </div>

        {/* Google sign-in */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full h-11 font-semibold"
          size="lg"
        >
          {googleLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">or sign up with email</span>
          </div>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-3">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button type="submit" className="w-full font-bold" size="lg" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save My Contract & Set Reminders
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          No credit card. No spam. Unsubscribe anytime.
        </p>

        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <button onClick={onSignInClick} className="text-primary hover:underline font-medium">
            Sign in
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default SavePromptModal;

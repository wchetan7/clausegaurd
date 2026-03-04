import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, Check, X } from "lucide-react";

const getPasswordStrength = (password: string) => {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passed / 3) * 100);
  const label = score <= 33 ? "Weak" : score <= 66 ? "Fair" : "Strong";
  const color = score <= 33 ? "bg-destructive" : score <= 66 ? "bg-yellow-500" : "bg-green-500";
  return { checks, score, label, color };
};

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && strength.score < 100) {
      toast({ title: "Weak password", description: "Password must be 8+ chars with an uppercase letter and a number.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!" });
        onOpenChange(false);
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "We sent you a confirmation link." });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl font-bold">
              {isLogin ? "Welcome Back" : "Start Your Free Trial"}
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Sign in to your account" : "Create an account to get started"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isLogin ? 6 : 8}
            />
            {!isLogin && password.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full transition-all ${strength.color}`} style={{ width: `${strength.score}%` }} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{strength.label}</span>
                </div>
                <ul className="space-y-1 text-xs">
                  {([["minLength", "At least 8 characters"], ["hasUppercase", "One uppercase letter"], ["hasNumber", "One number"]] as const).map(([key, label]) => (
                    <li key={key} className="flex items-center gap-1.5">
                      {strength.checks[key] ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-muted-foreground" />}
                      <span className={strength.checks[key] ? "text-foreground" : "text-muted-foreground"}>{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {!isLogin && (
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                I agree to the{" "}
                <Link to="/terms-of-service" className="text-primary hover:underline" target="_blank">Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline" target="_blank">Privacy Policy</Link>
              </label>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading || (!isLogin && !agreedToTerms)}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-2">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;

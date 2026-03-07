import { useState, useEffect } from "react";
import { useLocation, Outlet, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

const PROTECTED_PREFIXES = ["/dashboard", "/contracts", "/settings", "/reminders"];

const AuthenticatedLayout = () => {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isProtectedPath = PROTECTED_PREFIXES.some((prefix) =>
    location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isProtectedPath && !user) {
    return <Navigate to="/" replace />;
  }

  if (!user) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar userEmail={user.email} currentPath={location.pathname} />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
};

export default AuthenticatedLayout;

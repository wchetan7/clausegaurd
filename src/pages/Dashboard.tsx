import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import SummaryCards from "@/components/dashboard/SummaryCards";
import ContractsTable from "@/components/dashboard/ContractsTable";
import UploadModal from "@/components/dashboard/UploadModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/");
        return;
      }
      setUser(session.user);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchContracts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("contracts")
      .select("*")
      .order("created_at", { ascending: false });
    setContracts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchContracts();
  }, [user]);

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar userEmail={user.email} />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Monitor your vendor contracts at a glance.</p>
            </div>
            <Button onClick={() => setUploadOpen(true)} size="lg" className="shadow-glow">
              <Upload className="mr-2 h-4 w-4" />
              Upload Contract
            </Button>
          </div>

          <SummaryCards contracts={contracts} />
          <ContractsTable contracts={contracts} onUpload={() => setUploadOpen(true)} />
        </div>
      </main>

      {user && (
        <UploadModal
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          userId={user.id}
          onSuccess={fetchContracts}
        />
      )}
    </div>
  );
};

export default Dashboard;

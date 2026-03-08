import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import SummaryCards from "@/components/dashboard/SummaryCards";
import ContractsTable from "@/components/dashboard/ContractsTable";
import UploadModal from "@/components/dashboard/UploadModal";

const Dashboard = () => {
  const { user } = useOutletContext<{ user: any }>();
  const [contracts, setContracts] = useState<any[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState("starter");

  const fetchContracts = async () => {
    const { data } = await supabase
      .from("contracts")
      .select("*")
      .order("created_at", { ascending: false });
    setContracts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchContracts();
    supabase.from("profiles").select("plan").eq("user_id", user.id).single().then(({ data }) => {
      if (data?.plan) setUserPlan(data.plan);
    });
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("contracts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "contracts" }, () => fetchContracts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading...</div>;
  }

  return (
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

      <UploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        userId={user.id}
        onSuccess={fetchContracts}
      />
    </div>
  );
};

export default Dashboard;

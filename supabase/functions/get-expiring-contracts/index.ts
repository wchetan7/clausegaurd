import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = req.headers.get("x-api-key");
  const expectedKey = Deno.env.get("GET_EXPIRING_CONTRACTS_API_KEY");

  if (!apiKey || apiKey !== expectedKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const today = new Date();
  const thirtyDaysOut = new Date(today);
  thirtyDaysOut.setDate(today.getDate() + 30);

  const { data: contracts, error } = await supabase
    .from("contracts")
    .select("id, name, vendor, renewal_date, contract_value, notice_period_days, user_id")
    .eq("status", "analyzed")
    .eq("auto_renewal", true)
    .gte("renewal_date", today.toISOString().split("T")[0])
    .lte("renewal_date", thirtyDaysOut.toISOString().split("T")[0]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fetch user emails for matched contracts
  const userIds = [...new Set((contracts || []).map((c) => c.user_id))];
  const userEmails: Record<string, string> = {};

  for (const uid of userIds) {
    const { data } = await supabase.auth.admin.getUserById(uid);
    if (data?.user?.email) {
      userEmails[uid] = data.user.email;
    }
  }

  const result = (contracts || []).map((c) => {
    const daysLeft = Math.ceil(
      (new Date(c.renewal_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      id: c.id,
      name: c.name,
      vendor: c.vendor,
      renewal_date: c.renewal_date,
      contract_value: c.contract_value,
      notice_period_days: c.notice_period_days,
      user_email: userEmails[c.user_id] || null,
      days_left: daysLeft,
    };
  });

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

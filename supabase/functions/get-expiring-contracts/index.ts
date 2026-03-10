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

  // Use cancellation_deadline for triggering reminders, fall back to renewal_date
  const { data: contracts, error } = await supabase
    .from("contracts")
    .select("id, name, vendor, renewal_date, expiry_date, cancellation_deadline, contract_value, notice_period_days, user_id, owner_name, backup_email")
    .eq("status", "Reviewed")
    .eq("auto_renewal", true)
    .or(`cancellation_deadline.gte.${today.toISOString().split("T")[0]},renewal_date.gte.${today.toISOString().split("T")[0]}`)
    .or(`cancellation_deadline.lte.${thirtyDaysOut.toISOString().split("T")[0]},renewal_date.lte.${thirtyDaysOut.toISOString().split("T")[0]}`);

  if (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch contracts" }), {
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
      owner_name: c.owner_name || null,
      user_email: userEmails[c.user_id] || null,
      days_left: daysLeft,
    };
  });

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

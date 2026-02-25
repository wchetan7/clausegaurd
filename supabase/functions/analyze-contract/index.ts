import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { contract_id, pdf_text } = await req.json();
    if (!contract_id || !pdf_text) {
      return new Response(JSON.stringify({ error: "Missing contract_id or pdf_text" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the user owns this contract
    const { data: contract, error: contractErr } = await supabase
      .from("contracts")
      .select("id, name, vendor")
      .eq("id", contract_id)
      .single();

    if (contractErr || !contract) {
      return new Response(JSON.stringify({ error: "Contract not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update status to analyzing
    await supabase.from("contracts").update({ status: "Analyzing" }).eq("id", contract_id);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a contract analysis expert. Extract key clauses from vendor contracts and return structured JSON. Focus on: auto-renewal terms, price escalation clauses, termination fees, payment terms, liability limitations, IP ownership, data privacy terms. For each clause: classify it (use snake_case like "auto_renewal", "price_escalation", "termination_fee", "payment_terms", "liability_limitation", "ip_ownership", "data_privacy"), summarize in plain English (max 2 sentences), quote the exact text from the contract, and rate severity as LOW/MEDIUM/HIGH. Also extract these metadata fields by cross-referencing the clauses you found:
- auto_renewal: SET TO TRUE if you found ANY auto-renewal clause. Only set false if the contract explicitly states no auto-renewal. If auto-renewal clause severity is HIGH or MEDIUM, auto_renewal MUST be true.
- renewal_date: extract the actual date as ISO string (e.g. "2027-04-30"), or calculate from term start + duration if not stated explicitly. Never return null if dates are mentioned anywhere.
- notice_period_days: extract the number of days (e.g. 60), look inside auto-renewal and termination clauses for cancellation notice requirements.
- contract_value: annual total in USD as a number. Calculate from monthly/quarterly amounts if needed. Never return null if any pricing is mentioned.
IMPORTANT: The clauses array is the source of truth. Metadata fields must be consistent with extracted clauses. Never return null/N/A if a relevant clause exists. Return only valid JSON.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this contract:\n\n${pdf_text.substring(0, 15000)}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_contract_analysis",
              description: "Extract structured contract analysis data",
              parameters: {
                type: "object",
                properties: {
                  clauses: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        clause_type: { type: "string" },
                        severity: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
                        summary: { type: "string" },
                        raw_text: { type: "string" },
                        action_required: { type: "string" },
                      },
                      required: ["clause_type", "severity", "summary", "raw_text"],
                      additionalProperties: false,
                    },
                  },
                  renewal_date: { type: "string" },
                  notice_period_days: { type: "number" },
                  contract_value: { type: "number" },
                  auto_renewal: { type: "boolean" },
                },
                required: ["clauses"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_contract_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("contracts").update({ status: "Failed" }).eq("id", contract_id);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      await supabase.from("contracts").update({ status: "Failed" }).eq("id", contract_id);
      return new Response(JSON.stringify({ error: "AI returned no analysis" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Delete old clauses if re-analyzing
    await supabase.from("contract_clauses").delete().eq("contract_id", contract_id);

    // Insert extracted clauses
    if (analysis.clauses?.length) {
      const clauseRows = analysis.clauses.map((c: any) => ({
        contract_id,
        clause_type: c.clause_type,
        severity: c.severity,
        summary: c.summary,
        raw_text: c.raw_text,
        action_required: c.action_required || null,
      }));
      await supabase.from("contract_clauses").insert(clauseRows);
    }

    // Calculate overall risk from clause severities
    const severities = (analysis.clauses || []).map((c: any) => c.severity);
    let overallRisk = "Low";
    if (severities.includes("HIGH")) overallRisk = "High";
    else if (severities.includes("MEDIUM")) overallRisk = "Medium";

    // Update contract record
    const updates: any = {
      risk_score: overallRisk,
      status: "Analyzed",
    };
    if (analysis.renewal_date) updates.renewal_date = analysis.renewal_date;
    if (analysis.notice_period_days != null) updates.notice_period_days = analysis.notice_period_days;
    if (analysis.auto_renewal != null) updates.auto_renewal = analysis.auto_renewal;

    await supabase.from("contracts").update(updates).eq("id", contract_id);

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-contract error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

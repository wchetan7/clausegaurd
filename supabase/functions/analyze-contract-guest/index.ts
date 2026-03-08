import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pdf_text } = await req.json();

    if (!pdf_text) {
      return new Response(JSON.stringify({ error: "Missing pdf_text" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a contract analysis expert. Extract key clauses from vendor contracts and return structured JSON. Focus on: auto-renewal terms, price escalation clauses, termination fees, payment terms, liability limitations, IP ownership, data privacy terms. For each clause: classify it (use snake_case like "auto_renewal", "price_escalation", "termination_fee", "payment_terms", "liability_limitation", "ip_ownership", "data_privacy"), summarize in plain English (max 2 sentences), quote the exact text from the contract, and rate severity as LOW/MEDIUM/HIGH. Return only valid JSON.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    let aiResponse: Response;
    try {
      aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
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
    } catch (_abortErr) {
      return new Response(JSON.stringify({ error: "AI analysis timed out. Please retry." }), {
        status: 504,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "AI returned no analysis" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Calculate overall risk
    const hasHigh = (analysis.clauses || []).some((c: any) => c.severity === "HIGH");
    const hasMedium = (analysis.clauses || []).some((c: any) => c.severity === "MEDIUM");
    const riskScore = hasHigh ? "High" : hasMedium ? "Medium" : "Low";

    return new Response(JSON.stringify({ success: true, analysis: { ...analysis, risk_score: riskScore } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-contract-guest error:", e);
    return new Response(
      JSON.stringify({ error: "An internal error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

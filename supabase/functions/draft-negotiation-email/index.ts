import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vendor, contractName, annualValue, maxPct, clauseSummaries, type, cancelByDate } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt: string;
    let userPrompt: string;

    if (type === "cancellation") {
      systemPrompt = "You are a professional business communication specialist. Generate a formal, polite but firm cancellation letter for a vendor contract. Keep it concise and professional. Include the key dates and contract details provided. Output only the letter text, no extra commentary.";
      userPrompt = `Draft a cancellation letter for the following contract:
- Vendor: ${vendor}
- Contract: ${contractName}
- Annual Value: $${annualValue?.toLocaleString() || "N/A"}
- Cancellation Deadline: ${cancelByDate || "Not specified"}

The letter should:
1. Reference the specific contract
2. Clearly state intent to not renew / cancel
3. Reference the cancellation deadline
4. Request written confirmation of cancellation
5. Be professional and concise`;
    } else {
      systemPrompt = "You are a procurement negotiation expert. Generate a professional negotiation email that leverages specific contract clause findings to negotiate better terms. Be firm but professional. Output only the email text, no extra commentary.";
      userPrompt = `Draft a negotiation email for the following contract:
- Vendor: ${vendor}
- Contract: ${contractName}
- Current Annual Value: $${annualValue?.toLocaleString() || "N/A"}
- Maximum Price Increase Allowed: Up to ${maxPct}%
- Clause Findings: ${clauseSummaries?.join("; ") || "Price escalation clause detected"}

The email should:
1. Reference the specific price escalation terms found
2. Push back on automatic increases
3. Propose a cap or freeze on pricing
4. Mention market alternatives as leverage
5. Request a meeting to discuss terms
6. Be professional and data-driven`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI generation failed");
    }

    const result = await response.json();
    const email = result.choices?.[0]?.message?.content || "Unable to generate email. Please try again.";

    return new Response(JSON.stringify({ email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("draft-negotiation-email error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

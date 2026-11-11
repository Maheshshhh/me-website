import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type WritingKind = "summary" | "experience";

const pageOrigin = "https://maheshshhh.github.io";
const allowedOrigins = new Set([
  pageOrigin,
  ...(Deno.env.get("AI_ALLOWED_ORIGINS") ?? "").split(",").map((origin) => origin.trim()).filter(Boolean),
]);

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
  if (origin && allowedOrigins.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function jsonResponse(body: Record<string, unknown>, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405, origin);
  }
  if (origin && !allowedOrigins.has(origin)) {
    return jsonResponse({ error: "Origin is not allowed." }, 403, origin);
  }

  const authorization = request.headers.get("authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!authorization || !supabaseUrl || !supabaseAnonKey) {
    return jsonResponse({ error: "Authentication is required." }, 401, origin);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let user: { id: string } | null;
  try {
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError) return jsonResponse({ error: "Sign in to use AI writing." }, 401, origin);
    user = data.user;
  } catch (error) {
    console.error("Unable to verify the AI request session.", error instanceof Error ? error.message : "Unknown authentication error.");
    return jsonResponse({ error: "Unable to verify your session. Please try again." }, 502, origin);
  }
  if (!user) {
    return jsonResponse({ error: "Sign in to use AI writing." }, 401, origin);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400, origin);
  }
  if (!body || typeof body !== "object") {
    return jsonResponse({ error: "Request body is invalid." }, 400, origin);
  }
  const requestBody = body as Record<string, unknown>;
  const kind = requestBody.kind;
  const text = requestBody.text;
  if (kind !== "summary" && kind !== "experience") {
    return jsonResponse({ error: "Choose a supported profile text type." }, 400, origin);
  }
  if (typeof text !== "string" || text.trim().length < 3 || text.length > 5000) {
    return jsonResponse({ error: "Text must be between 3 and 5,000 characters." }, 400, origin);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return jsonResponse({ error: "AI writing is not configured. Add the Gemini API key to Supabase Function secrets." }, 503, origin);
  }

  const { data: allowed, error: limitError } = await supabase.rpc("consume_ai_writing_request");
  if (limitError) {
    console.error("AI writing rate-limit check failed.", limitError.message);
    return jsonResponse({ error: "AI writing is not configured yet. Apply the AI writing database migration." }, 503, origin);
  }
  if (!allowed) {
    return jsonResponse({ error: "You've reached the AI writing limit. Please try again in an hour." }, 429, origin);
  }

  const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
  const instruction = kind === "summary"
    ? "Improve the user's professional profile summary. Keep it concise, clear, and professional. Preserve the user's meaning and facts. Do not invent achievements, employers, skills, metrics, or years of experience. Return only the revised summary."
    : "Improve the user's work-experience highlights. Make the writing clear, concise, and impact-focused while preserving the original facts. Do not invent accomplishments, metrics, technologies, or responsibilities. Return only the revised text.";

  let providerResponse: Response;
  try {
    providerResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instruction }] },
        contents: [{ role: "user", parts: [{ text: text.trim() }] }],
        generationConfig: { temperature: 0.35, maxOutputTokens: kind === "summary" ? 450 : 300 },
      }),
    });
  } catch (error) {
    console.error("AI provider request failed.", error instanceof Error ? error.message : "Unknown network error.");
    return jsonResponse({ error: "AI service is temporarily unavailable. Please try again." }, 502, origin);
  }
  if (!providerResponse.ok) {
    console.error("AI provider returned an error status.", providerResponse.status);
    return jsonResponse({ error: providerResponse.status === 429
      ? "The AI provider is busy or its free-tier limit was reached. Try again later."
      : "AI service could not generate a suggestion. Please try again." }, providerResponse.status === 429 ? 429 : 502, origin);
  }

  let result: {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  try {
    result = await providerResponse.json();
  } catch {
    console.error("AI provider returned invalid JSON.");
    return jsonResponse({ error: "AI service returned an invalid response. Please try again." }, 502, origin);
  }
  const suggestion = result.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!suggestion) {
    return jsonResponse({ error: "AI could not produce a suggestion for this text." }, 422, origin);
  }
  return jsonResponse({ suggestion }, 200, origin);
});

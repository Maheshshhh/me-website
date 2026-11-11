import type { AiWritingKind } from "./components/AiTextField";
import { supabase } from "./supabase";

export async function improveProfileText(kind: AiWritingKind, text: string): Promise<string> {
  if (!supabase) {
    throw new Error("AI writing is available in the Supabase-configured UAT and production environments.");
  }

  const { data, error } = await supabase.functions.invoke("improve-profile-text", {
    body: { kind, text },
  });
  if (error) {
    if (error.context instanceof Response) {
      const payload: unknown = await error.context.clone().json().catch((parseError: unknown) => {
        console.warn("Unable to read the AI function error response.", parseError);
        return null;
      });
      if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
        throw new Error(payload.error);
      }
    }
    throw new Error("AI suggestion failed. Check that the Edge Function and provider key are configured, then try again.");
  }
  if (typeof data?.suggestion !== "string" || !data.suggestion.trim()) {
    throw new Error("The AI service returned an empty suggestion. Please try again.");
  }
  return data.suggestion.trim();
}

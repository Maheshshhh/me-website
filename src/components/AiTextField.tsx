import { useState } from "react";

export type AiWritingKind = "summary" | "experience";

type AiTextFieldProps = {
  label: string;
  value: string;
  rows: number;
  maxLength: number;
  kind: AiWritingKind;
  onChange: (value: string) => void;
  onImprove: (kind: AiWritingKind, text: string) => Promise<string>;
};

export default function AiTextField({ label, value, rows, maxLength, kind, onChange, onImprove }: AiTextFieldProps) {
  const [suggestion, setSuggestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleImprove() {
    setBusy(true);
    setError("");
    setSuggestion("");
    try {
      setSuggestion(await onImprove(kind, value));
    } catch (improveError) {
      setError(improveError instanceof Error ? improveError.message : "Unable to generate a suggestion. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ai-text-field editor-full">
      <label>{label}<textarea rows={rows} maxLength={maxLength} value={value} onChange={(event) => onChange(event.target.value)} /></label>
      <button className="button button-outline ai-improve-button" type="button" onClick={() => void handleImprove()} disabled={busy || value.trim().length < 3}>
        {busy ? "Improving…" : "Improve with AI"}
      </button>
      <p className="ai-privacy-note">Only this text is sent to AI. Review the suggestion for accuracy before applying it.</p>
      {error && <p className="auth-feedback auth-error" role="alert">{error}</p>}
      {suggestion && (
        <div className="ai-suggestion" aria-live="polite">
          <label>AI suggestion<textarea rows={rows} maxLength={maxLength} value={suggestion} onChange={(event) => setSuggestion(event.target.value)} /></label>
          <div className="ai-suggestion-actions">
            <button className="button button-outline" type="button" onClick={() => setSuggestion("")}>Discard</button>
            <button className="button button-primary" type="button" onClick={() => { onChange(suggestion); setSuggestion(""); }}>Use suggestion</button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, type FormEvent } from "react";

export type AuthMode = "signin" | "signup";

type AuthScreenProps = {
  error: string;
  message: string;
  busy: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>, mode: AuthMode) => void;
};

export default function AuthScreen({ error, message, busy, onSubmit }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("signin");

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand auth-brand">
          <span className="brand-mark"><span /></span>
          <span>career<span className="brand-light">folio</span></span>
        </div>
        <div className="eyebrow">YOUR CAREER, IN ONE PLACE</div>
        <h1>{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-description">{mode === "signin" ? "Sign in to pick up where you left off." : "Create a secure account to start building your profile."}</p>
        <form className="edit-form auth-form" onSubmit={(event) => onSubmit(event, mode)}>
          <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} required /></label>
          {error && <p className="auth-feedback auth-error" role="alert">{error}</p>}
          {message && <p className="auth-feedback auth-message" role="status">{message}</p>}
          <button className="button button-primary auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
        </form>
        <p className="auth-switch">{mode === "signin" ? "New to Careerfolio?" : "Already have an account?"} <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "Create an account" : "Sign in"}</button></p>
        <p className="auth-privacy">Your profile details are private to your account.</p>
      </section>
    </main>
  );
}

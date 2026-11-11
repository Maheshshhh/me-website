import type { FormEvent } from "react";
import type { AuthPage } from "../routes";

type AuthScreenProps = {
  page: AuthPage;
  configured: boolean;
  localMode: boolean;
  error: string;
  message: string;
  busy: boolean;
  onNavigate: (page: AuthPage) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>, page: AuthPage) => void;
};

const pageContent: Record<AuthPage, { title: string; description: string; submit: string }> = {
  login: {
    title: "Welcome back",
    description: "Sign in to view your professional profile.",
    submit: "Sign in",
  },
  signup: {
    title: "Create your account",
    description: "Sign up to access your private professional profile.",
    submit: "Create account",
  },
  "forgot-password": {
    title: "Reset your password",
    description: "Enter your email and we'll send you a password reset link.",
    submit: "Send reset link",
  },
  "reset-password": {
    title: "Choose a new password",
    description: "Use at least 8 characters for your new password.",
    submit: "Update password",
  },
};

export default function AuthScreen({
  page,
  configured,
  localMode,
  error,
  message,
  busy,
  onNavigate,
  onSubmit,
}: AuthScreenProps) {
  const content = pageContent[page];
  const needsPassword = page === "login" || page === "signup";
  const needsEmail = page !== "reset-password" && !localMode;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <a className="brand auth-brand" href={import.meta.env.BASE_URL}>
          <span className="brand-mark"><span /></span>
          <span>career<span className="brand-light">folio</span></span>
        </a>
        <div className="eyebrow">YOUR CAREER, IN ONE PLACE</div>
        <h1>{content.title}</h1>
        <p className="auth-description">
          {localMode ? "Sign in with the local test account to view the dashboard." : content.description}
        </p>
        {!configured && (
          <p className="auth-feedback auth-error" role="alert">
            Authentication is not configured in this environment. You can enter your details, but sign-in is unavailable here.
          </p>
        )}
        <form className="edit-form auth-form" onSubmit={(event) => onSubmit(event, page)}>
          {localMode && page === "login" && (
            <label>
              Username
              <input name="username" type="text" autoComplete="username" required disabled={busy} />
            </label>
          )}
          {needsEmail && (
            <label>
              Email address
              <input name="email" type="email" autoComplete="email" required disabled={busy} />
            </label>
          )}
          {needsPassword && (
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete={page === "login" ? "current-password" : "new-password"}
                minLength={8}
                required
                disabled={busy}
              />
            </label>
          )}
          {page === "reset-password" && (
            <>
              <label>
                New password
                <input name="password" type="password" autoComplete="new-password" minLength={8} required disabled={busy} />
              </label>
              <label>
                Confirm new password
                <input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required disabled={busy} />
              </label>
            </>
          )}
          {error && <p className="auth-feedback auth-error" role="alert">{error}</p>}
          {message && <p className="auth-feedback auth-message" role="status">{message}</p>}
          <button className="button button-primary auth-submit" disabled={!configured || busy}>
            {busy ? "Please wait…" : content.submit}
          </button>
        </form>

        {!localMode && page === "login" && (
          <div className="auth-links">
            <button type="button" onClick={() => onNavigate("forgot-password")}>Forgot password?</button>
            <p className="auth-switch">New to Careerfolio? <button type="button" onClick={() => onNavigate("signup")}>Create an account</button></p>
          </div>
        )}
        {!localMode && page === "signup" && (
          <p className="auth-switch">Already have an account? <button type="button" onClick={() => onNavigate("login")}>Sign in</button></p>
        )}
        {!localMode && (page === "forgot-password" || page === "reset-password") && (
          <p className="auth-switch"><button type="button" onClick={() => onNavigate("login")}>Back to sign in</button></p>
        )}
        <p className="auth-privacy">Your profile details are private to your account.</p>
      </section>
    </main>
  );
}

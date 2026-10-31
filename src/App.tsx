import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createEmptyProfile, demoProfile, type Achievement, type Education, type Experience, type Profile, type Project, type View } from "./profile";
import { supabase } from "./supabase";

const appEnvironment = import.meta.env.VITE_APP_ENV ?? "development";
const navigation: { label: View; icon: string }[] = [
  { label: "Overview", icon: "grid" },
  { label: "Personal details", icon: "user" },
  { label: "Experience", icon: "briefcase" },
  { label: "Skills", icon: "sparkles" },
  { label: "Achievements", icon: "award" },
  { label: "Projects & education", icon: "graduation" },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M5 21v-1a7 7 0 0 1 14 0v1" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    sparkles: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" /></>,
    award: <><circle cx="12" cy="8" r="6" /><path d="m8.2 13-1.2 8 5-2.5 5 2.5-1.2-8" /></>,
    graduation: <><path d="m2 10 10-5 10 5-10 5-10-5Z" /><path d="M6 12v5c3.4 2.5 8.6 2.5 12 0v-5M22 10v6" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    edit: <><path d="m16 4 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  };
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] ?? paths.grid}
    </svg>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeProfile(value: unknown, fallback: Profile): Profile {
  if (!isRecord(value)) return fallback;
  const text = (key: keyof Profile, defaultValue: string) =>
    typeof value[key] === "string" ? value[key] as string : defaultValue;
  const skills = Array.isArray(value.skills) ? value.skills.filter((item): item is string => typeof item === "string") : fallback.skills;
  const experience = Array.isArray(value.experience)
    ? value.experience.filter(isRecord).map((item) => ({
      role: typeof item.role === "string" ? item.role : "",
      company: typeof item.company === "string" ? item.company : "",
      dates: typeof item.dates === "string" ? item.dates : "",
      description: typeof item.description === "string" ? item.description : "",
    }))
    : fallback.experience;
  const projects = Array.isArray(value.projects)
    ? value.projects.filter(isRecord).map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      domain: typeof item.domain === "string" ? item.domain : "",
      description: typeof item.description === "string" ? item.description : "",
    }))
    : fallback.projects;
  const education = Array.isArray(value.education)
    ? value.education.filter(isRecord).map((item) => ({
      degree: typeof item.degree === "string" ? item.degree : "",
      institution: typeof item.institution === "string" ? item.institution : "",
      dates: typeof item.dates === "string" ? item.dates : "",
      location: typeof item.location === "string" ? item.location : "",
    }))
    : fallback.education;
  const achievements = Array.isArray(value.achievements)
    ? value.achievements.filter(isRecord).map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      issuer: typeof item.issuer === "string" ? item.issuer : "",
      year: typeof item.year === "string" ? item.year : "",
    }))
    : fallback.achievements;
  return {
    name: text("name", fallback.name),
    title: text("title", fallback.title),
    location: text("location", fallback.location),
    email: text("email", fallback.email),
    phone: text("phone", fallback.phone),
    website: text("website", fallback.website),
    summary: text("summary", fallback.summary),
    skills,
    experience,
    achievements,
    projects,
    education,
    resumeName: text("resumeName", fallback.resumeName),
    resumePath: text("resumePath", fallback.resumePath ?? ""),
  };
}

function loadDemoProfile(): Profile {
  try {
    const saved = localStorage.getItem("careerfolio-profile-mahesh-v1");
    return saved ? normalizeProfile(JSON.parse(saved), demoProfile) : demoProfile;
  } catch (error) {
    console.error("Unable to load the saved profile.", error);
    return demoProfile;
  }
}

function App() {
  const [profile, setProfile] = useState<Profile>(() => supabase ? createEmptyProfile("") : loadDemoProfile());
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [profileReady, setProfileReady] = useState(!supabase);
  const [profileError, setProfileError] = useState("");
  const [saveStatus, setSaveStatus] = useState(supabase ? "Connecting…" : "Demo data · saved locally");
  const [activeView, setActiveView] = useState<View>("Overview");
  const [modal, setModal] = useState<"personal" | "experience" | "achievement" | null>(null);
  const [toast, setToast] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  useEffect(() => {
    if (!supabase) {
      try {
        localStorage.setItem("careerfolio-profile-mahesh-v1", JSON.stringify(profile));
      } catch (error) {
        console.error("Unable to save the profile in browser storage.", error);
        setToast("Changes couldn't be saved in this browser.");
      }
      return;
    }
    const client = supabase;
    if (!client || !authUser || !profileReady) return;

    setSaveStatus("Saving…");
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const { error } = await client.from("profiles").upsert({
            user_id: authUser.id,
            profile_data: profile,
          });
          if (error) throw error;
          setSaveStatus("All changes saved");
        } catch (error) {
          console.error("Unable to save the profile to Supabase.", error);
          setSaveStatus("Save failed");
          setToast("Your changes couldn't be saved. Check your connection and try again.");
        }
      })();
    }, 450);
    return () => window.clearTimeout(timer);
  }, [profile, authUser, profileReady]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const nextUser = session?.user ?? null;
      setAuthUser(nextUser);
      setProfileError("");
      setProfileReady(!nextUser);
      if (!nextUser) setProfile(createEmptyProfile(""));
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthError(error.message);
      setAuthUser(data.session?.user ?? null);
      setAuthReady(true);
    }).catch((error: unknown) => {
      if (!active) return;
      console.error("Unable to restore the Supabase session.", error);
      setAuthError("Unable to connect to the account service. Check your Supabase configuration.");
      setAuthReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !authUser) return;
    let active = true;
    setProfileReady(false);

    void (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("profile_data")
          .eq("user_id", authUser.id)
          .maybeSingle();
        if (error) throw error;
        if (!active) return;
        const fallback = createEmptyProfile(authUser.email ?? "");
        setProfile(data ? normalizeProfile(data.profile_data, fallback) : fallback);
        setProfileError("");
        setProfileReady(true);
      } catch (error) {
        if (!active) return;
        console.error("Unable to load the Supabase profile.", error);
        setProfileError("Couldn't load your profile. Check the Supabase migration and try again.");
      }
    })();

    return () => { active = false; };
  }, [authUser?.id]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const completion = useMemo(() => {
    const checks = [
      Boolean(profile.name && profile.title),
      Boolean(profile.summary),
      profile.experience.length > 0,
      profile.skills.length >= 3,
      profile.achievements.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);

  function updateProfile<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function showToast(message: string) {
    setToast(message);
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>, mode: "signin" | "signup") {
    event.preventDefault();
    if (!supabase) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setAuthBusy(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const result = mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) {
        setAuthMessage("Check your email to confirm your account, then sign in.");
      }
    } catch (error) {
      console.error("Supabase authentication failed.", error);
      setAuthError(error instanceof Error ? error.message : "Authentication failed. Try again.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Unable to sign out of Supabase.", error);
      showToast("Unable to sign out. Try again.");
    }
  }

  function addSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const skill = String(form.get("skill") ?? "").trim();
    if (!skill) return;
    if (profile.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      showToast("That skill is already on your profile.");
      return;
    }
    updateProfile("skills", [...profile.skills, skill]);
    event.currentTarget.reset();
    showToast("Skill added to your profile.");
  }

  function removeSkill(skillToRemove: string) {
    updateProfile("skills", profile.skills.filter((skill) => skill !== skillToRemove));
  }

  function addExperience(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item: Experience = {
      role: String(form.get("role") ?? "").trim(),
      company: String(form.get("company") ?? "").trim(),
      dates: String(form.get("dates") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
    };
    if (!item.role || !item.company) return;
    updateProfile("experience", [item, ...profile.experience]);
    setModal(null);
    showToast("Experience added.");
  }

  function addAchievement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item: Achievement = {
      title: String(form.get("title") ?? "").trim(),
      issuer: String(form.get("issuer") ?? "").trim(),
      year: String(form.get("year") ?? "").trim(),
    };
    if (!item.title || !item.issuer) return;
    updateProfile("achievements", [item, ...profile.achievements]);
    setModal(null);
    showToast("Achievement added.");
  }

  function copyProfileLink() {
    showToast("Public profile sharing isn't enabled yet.");
  }

  function renderMain() {
    switch (activeView) {
      case "Personal details":
        return <PersonalDetails profile={profile} onEdit={() => setModal("personal")} />;
      case "Experience":
        return <ExperienceSection experience={profile.experience} onAdd={() => setModal("experience")} onRemove={(index) => updateProfile("experience", profile.experience.filter((_, itemIndex) => itemIndex !== index))} />;
      case "Skills":
        return <SkillsSection skills={profile.skills} onAdd={addSkill} onRemove={removeSkill} />;
      case "Achievements":
        return <AchievementsSection achievements={profile.achievements} onAdd={() => setModal("achievement")} onRemove={(index) => updateProfile("achievements", profile.achievements.filter((_, itemIndex) => itemIndex !== index))} />;
      case "Projects & education":
        return <ProjectsEducationSection projects={profile.projects} education={profile.education} />;
      default:
        return (
          <Overview
            profile={profile}
            completion={completion}
            onNavigate={setActiveView}
            onEdit={() => setModal("personal")}
            onCopy={copyProfileLink}
            onAddExperience={() => setModal("experience")}
          />
        );
    }
  }

  if (supabase && !authReady) {
    return <LoadingScreen message="Connecting to your account…" />;
  }
  if (supabase && !authUser) {
    return <AuthScreen error={authError} message={authMessage} busy={authBusy} onSubmit={handleAuth} />;
  }
  if (supabase && authUser && profileError) {
    return <LoadingScreen message={profileError} action="Retry" onAction={() => window.location.reload()} />;
  }
  if (supabase && authUser && !profileReady) {
    return <LoadingScreen message="Loading your profile…" />;
  }

  return (
    <div className="app-shell">
      {mobileNavOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setActiveView("Overview"); }}>
          <span className="brand-mark"><span /></span>
          <span>career<span className="brand-light">folio</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Profile sections">
          {navigation.map((item) => (
            <button key={item.label} className={`nav-item ${activeView === item.label ? "active" : ""}`} onClick={() => { setActiveView(item.label); setMobileNavOpen(false); }}>
              <Icon name={item.icon} size={17} />
              <span>{item.label}</span>
              {item.label === "Personal details" && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><Icon name="sparkles" size={17} /></div>
            <strong>Make your next move</strong>
            <p>A complete profile helps the right people find you.</p>
            <button onClick={() => setActiveView("Overview")}>View profile tips <Icon name="chevron" size={14} /></button>
          </div>
          <button className="account-row" onClick={() => setActiveView("Personal details")}>
            <Avatar name={profile.name} small />
            <span className="account-name">{profile.name}<small>{supabase ? authUser?.email : "Personal account"}</small></span>
            <span className="account-more">···</span>
          </button>
          {supabase && <button className="logout-button" onClick={handleSignOut}>Sign out</button>}
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Icon name="menu" /></button>
          <div className="breadcrumb"><span>My profile</span><Icon name="chevron" size={14} /><strong>{activeView}</strong></div>
          <div className="topbar-actions">
            <span className={`environment-badge environment-${appEnvironment}`}>{appEnvironment.toUpperCase()}</span>
            <span className="saved-status"><span /> {saveStatus}</span>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => showToast("You're all caught up.")}><Icon name="bell" /></button>
            <button className="top-avatar" onClick={() => setActiveView("Personal details")} aria-label="Open personal details"><Avatar name={profile.name} small /></button>
          </div>
        </header>
        <div className="content-wrap">
          {renderMain()}
          <footer className="page-footer">
            <span>© 2025 Careerfolio</span>
            <span><span className="privacy-dot" /> Your profile is private until you share it</span>
            <button onClick={() => showToast("Help center coming soon.")}>Help center</button>
          </footer>
        </div>
      </main>
      {toast && <div className="toast" role="status"><span className="toast-check"><Icon name="check" size={15} /></span>{toast}</div>}
      {modal && (
        <Modal title={modal === "personal" ? "Edit personal details" : modal === "experience" ? "Add experience" : "Add achievement"} onClose={() => setModal(null)}>
          {modal === "personal" ? (
            <form className="edit-form" onSubmit={(event) => { event.preventDefault(); const values = new FormData(event.currentTarget); updateProfile("name", String(values.get("name") ?? "").trim()); updateProfile("title", String(values.get("title") ?? "").trim()); updateProfile("location", String(values.get("location") ?? "").trim()); updateProfile("email", String(values.get("email") ?? "").trim()); updateProfile("website", String(values.get("website") ?? "").trim()); updateProfile("summary", String(values.get("summary") ?? "").trim()); setModal(null); showToast("Your details have been updated."); }}>
              <label>Full name<input name="name" defaultValue={profile.name} required /></label>
              <label>Professional title<input name="title" defaultValue={profile.title} required /></label>
              <label>Location<input name="location" defaultValue={profile.location} /></label>
              <label>Email<input type="email" name="email" defaultValue={profile.email} /></label>
              <label>Website<input name="website" defaultValue={profile.website} /></label>
              <label>About you<textarea name="summary" defaultValue={profile.summary} rows={4} maxLength={400} /></label>
              <div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setModal(null)}>Cancel</button><button className="button button-primary">Save details</button></div>
            </form>
          ) : modal === "experience" ? (
            <form className="edit-form" onSubmit={addExperience}>
              <label>Job title<input name="role" placeholder="e.g. Product Designer" required /></label>
              <label>Company<input name="company" placeholder="e.g. Acme Inc." required /></label>
              <label>Dates<input name="dates" placeholder="e.g. 2022 — Present" /></label>
              <label>Description<textarea name="description" rows={3} placeholder="What did you work on?" /></label>
              <div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setModal(null)}>Cancel</button><button className="button button-primary">Add experience</button></div>
            </form>
          ) : (
            <form className="edit-form" onSubmit={addAchievement}>
              <label>Achievement or certification<input name="title" placeholder="e.g. UX Design Professional Certificate" required /></label>
              <label>Issuer<input name="issuer" placeholder="e.g. Google" required /></label>
              <label>Year<input name="year" placeholder="e.g. 2024" /></label>
              <div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setModal(null)}>Cancel</button><button className="button button-primary">Add achievement</button></div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}

function AuthScreen({ error, message, busy, onSubmit }: {
  error: string;
  message: string;
  busy: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>, mode: "signin" | "signup") => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

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

function LoadingScreen({ message, action, onAction }: { message: string; action?: string; onAction?: () => void }) {
  return (
    <main className="loading-screen">
      <div className="loading-card" role="status">
        {!action && <span className="loading-spinner" />}
        <p>{message}</p>
        {action && onAction && <button className="button button-primary" onClick={onAction}>{action}</button>}
      </div>
    </main>
  );
}

function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase();
  return <span className={`avatar ${small ? "avatar-small" : ""}`}>{initials}</span>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Overview({ profile, completion, onNavigate, onEdit, onCopy, onAddExperience }: { profile: Profile; completion: number; onNavigate: (view: View) => void; onEdit: () => void; onCopy: () => void; onAddExperience: () => void }) {
  return (
    <>
      <PageHeading eyebrow="YOUR CAREER, AT A GLANCE" title={`Good morning, ${profile.name.split(" ")[0] || "there"}`} description="A little progress today can open a big door tomorrow." action={<button className="button button-outline" onClick={onCopy}><Icon name="link" size={16} /> Share profile</button>} />
      <section className="profile-hero">
        <div className="hero-top"><div className="hero-label"><span className="live-dot" /> YOUR PROFESSIONAL PROFILE</div><button className="icon-button hero-edit" aria-label="Edit profile" onClick={onEdit}><Icon name="edit" size={17} /></button></div>
        <div className="hero-person">
          <Avatar name={profile.name} />
          <div className="hero-info"><h2>{profile.name}</h2><p>{profile.title} <span>·</span> {profile.location}</p><div className="hero-contact"><span>{profile.email}</span><span className="contact-divider" /> <span>{profile.website}</span></div></div>
          <button className="button button-light" onClick={onEdit}><Icon name="edit" size={15} /> Edit profile</button>
        </div>
        <div className="hero-bottom">
          <p>{profile.summary}</p>
          <div className="profile-meta"><span><Icon name="briefcase" size={15} /> {profile.experience.length} roles</span><span><Icon name="sparkles" size={15} /> {profile.skills.length} skills</span><span><Icon name="award" size={15} /> {profile.achievements.length} highlights</span></div>
        </div>
      </section>

      <div className="overview-grid">
        <section className="completion-card">
          <div className="card-heading"><div><span className="eyebrow">PROFILE STRENGTH</span><h3>You're off to a great start</h3></div><span className="completion-number">{completion}%</span></div>
          <div className="progress-track"><span style={{ width: `${completion}%` }} /></div>
          <p className="card-muted">A well-rounded profile makes it easier for opportunities to find you.</p>
          <div className="check-list">
            <CompletionItem complete={Boolean(profile.name && profile.title)} label="Personal details" onClick={() => onNavigate("Personal details")} />
            <CompletionItem complete={Boolean(profile.summary)} label="About you" onClick={() => onNavigate("Personal details")} />
            <CompletionItem complete={profile.experience.length > 0} label="Work experience" onClick={() => onNavigate("Experience")} />
            <CompletionItem complete={profile.skills.length >= 3} label="Skills & expertise" onClick={() => onNavigate("Skills")} />
            <CompletionItem complete={profile.achievements.length > 0} label="Achievements" onClick={() => onNavigate("Achievements")} />
          </div>
        </section>

        <section className="experience-card">
          <div className="section-card-heading"><div><span className="eyebrow">THE JOURNEY SO FAR</span><h3>Experience</h3></div><button className="text-link" onClick={() => onNavigate("Experience")}>See all <Icon name="arrow" size={14} /></button></div>
          <div className="timeline compact-timeline">
            {profile.experience.slice(0, 2).map((item, index) => <div className="timeline-item" key={`${item.company}-${index}`}><span className="timeline-marker" /><div><div className="experience-title-row"><h4>{item.role}</h4><span className="date-label">{item.dates}</span></div><p className="company-line">{item.company}</p></div></div>)}
            {profile.experience.length === 0 && <p className="empty-note">Add your first role to bring your journey to life.</p>}
          </div>
          <button className="add-inline" onClick={onAddExperience}><Icon name="plus" size={15} /> Add experience</button>
        </section>

        <section className="skills-card">
          <div className="section-card-heading"><div><span className="eyebrow">WHAT YOU BRING</span><h3>Skills & expertise</h3></div><button className="text-link" onClick={() => onNavigate("Skills")}>Manage <Icon name="arrow" size={14} /></button></div>
          <div className="skill-list">{profile.skills.slice(0, 6).map((skill) => <span className="skill-chip" key={skill}>{skill}</span>)}</div>
          {profile.skills.length === 0 && <p className="empty-note">Add skills that show what you do best.</p>}
        </section>
      </div>
    </>
  );
}

function CompletionItem({ complete, label, onClick }: { complete: boolean; label: string; onClick: () => void }) {
  return <button className="completion-item" onClick={onClick}><span className={`completion-check ${complete ? "complete" : ""}`}>{complete && <Icon name="check" size={12} />}</span><span>{label}</span><Icon name="chevron" size={14} /></button>;
}

function PersonalDetails({ profile, onEdit }: { profile: Profile; onEdit: () => void }) {
  return (
    <>
      <PageHeading eyebrow="GET TO KNOW YOU" title="Personal details" description="The essentials that help people put a name to your work." action={<button className="button button-primary" onClick={onEdit}><Icon name="edit" size={16} /> Edit details</button>} />
      <section className="detail-card">
        <div className="detail-profile"><Avatar name={profile.name} /><div><h2>{profile.name}</h2><p>{profile.title}</p></div><span className="profile-status"><span className="live-dot" /> Profile active</span></div>
        <div className="detail-divider" />
        <div className="detail-grid">
          <DetailItem label="EMAIL ADDRESS" value={profile.email} />
          <DetailItem label="LOCATION" value={profile.location || "Add your location"} />
          <DetailItem label="WEBSITE" value={profile.website || "Add your website"} />
        </div>
        <div className="about-block"><span className="eyebrow">ABOUT</span><p>{profile.summary || "Tell people a little about yourself and the work you love."}</p></div>
      </section>
    </>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return <div className="detail-item"><span className="eyebrow">{label}</span><p>{value}</p></div>;
}

function ExperienceSection({ experience, onAdd, onRemove }: { experience: Experience[]; onAdd: () => void; onRemove: (index: number) => void }) {
  return (
    <>
      <PageHeading eyebrow="THE JOURNEY SO FAR" title="Experience" description="Showcase the work, teams, and moments that shaped your career." action={<button className="button button-primary" onClick={onAdd}><Icon name="plus" size={17} /> Add experience</button>} />
      <section className="section-panel">
        <div className="section-panel-heading"><div><h3>Work history</h3><p>Your most recent roles and the impact you've made.</p></div><span className="count-pill">{experience.length} {experience.length === 1 ? "role" : "roles"}</span></div>
        {experience.length ? <div className="timeline full-timeline">{experience.map((item, index) => <div className="timeline-item" key={`${item.company}-${index}`}><span className="timeline-marker" /><div className="timeline-content"><div className="experience-title-row"><div><h4>{item.role}</h4><p className="company-line">{item.company}</p></div><div className="timeline-actions"><span className="date-label">{item.dates}</span><button className="remove-button" aria-label={`Remove ${item.role} at ${item.company}`} onClick={() => onRemove(index)}><Icon name="close" size={15} /></button></div></div><p className="experience-description">{item.description || "Add a short description of your work and impact."}</p></div></div>)}</div> : <EmptyState title="Your next chapter starts here" description="Add a role to tell the story of where you've been." action="Add experience" onClick={onAdd} />}
      </section>
    </>
  );
}

function SkillsSection({ skills, onAdd, onRemove }: { skills: string[]; onAdd: (event: FormEvent<HTMLFormElement>) => void; onRemove: (skill: string) => void }) {
  return (
    <>
      <PageHeading eyebrow="WHAT YOU BRING" title="Skills & expertise" description="Give people a quick sense of what you're great at." />
      <section className="section-panel">
        <div className="section-panel-heading"><div><h3>Your skills</h3><p>Choose skills that reflect how you work and what you know.</p></div><span className="count-pill">{skills.length} skills</span></div>
        <div className="skill-list skill-list-large">{skills.map((skill) => <span className="skill-chip removable" key={skill}>{skill}<button aria-label={`Remove ${skill}`} onClick={() => onRemove(skill)}><Icon name="close" size={13} /></button></span>)}</div>
        {!skills.length && <EmptyState title="Start with what you know" description="Add skills to help your profile stand out." />}
        <form className="add-skill-form" onSubmit={onAdd}><label htmlFor="skill-input">Add a skill</label><div><input id="skill-input" name="skill" placeholder="e.g. Product strategy" maxLength={40} required /><button className="button button-primary"><Icon name="plus" size={16} /> Add skill</button></div></form>
      </section>
    </>
  );
}

function AchievementsSection({ achievements, onAdd, onRemove }: { achievements: Achievement[]; onAdd: () => void; onRemove: (index: number) => void }) {
  return (
    <>
      <PageHeading eyebrow="MILESTONES & RECOGNITION" title="Achievements" description="Celebrate the certifications, awards, and milestones you're proud of." action={<button className="button button-primary" onClick={onAdd}><Icon name="plus" size={17} /> Add achievement</button>} />
      <section className="section-panel">
        <div className="section-panel-heading"><div><h3>Highlights</h3><p>Little proof points that say a lot about you.</p></div><span className="count-pill">{achievements.length} {achievements.length === 1 ? "highlight" : "highlights"}</span></div>
        {achievements.length ? <div className="achievement-list">{achievements.map((item, index) => <div className="achievement-row" key={`${item.title}-${index}`}><span className="achievement-icon"><Icon name="award" size={20} /></span><div className="achievement-copy"><h4>{item.title}</h4><p>{item.issuer}{item.year ? ` · ${item.year}` : ""}</p></div><button className="remove-button" aria-label={`Remove ${item.title}`} onClick={() => onRemove(index)}><Icon name="close" size={15} /></button></div>)}</div> : <EmptyState title="Every milestone has a story" description="Add a certification or achievement you want people to know about." action="Add achievement" onClick={onAdd} />}
      </section>
    </>
  );
}

function ProjectsEducationSection({ projects, education }: { projects: Project[]; education: Education[] }) {
  return (
    <>
      <PageHeading eyebrow="SELECTED WORK & LEARNING" title="Projects & education" description="A snapshot of the domains you've worked in and the foundation behind your skills." />
      <section className="section-panel">
        <div className="section-panel-heading"><div><h3>Projects & domains</h3><p>Representative applications and industries from your resume.</p></div><span className="count-pill">{projects.length} projects</span></div>
        {projects.length ? (
          <div className="project-list">
            {projects.map((project) => (
              <article className="project-card" key={project.title}>
                <span className="project-icon"><Icon name="briefcase" size={18} /></span>
                <div><h4>{project.title}</h4><span className="project-domain">{project.domain}</span><p>{project.description}</p></div>
              </article>
            ))}
          </div>
        ) : <EmptyState title="Projects will appear here" description="Add project experience to your profile." />}
      </section>
      <section className="section-panel education-panel">
        <div className="section-panel-heading"><div><h3>Education</h3><p>Your academic background.</p></div><span className="count-pill">{education.length} {education.length === 1 ? "qualification" : "qualifications"}</span></div>
        {education.length ? (
          <div className="education-list">
            {education.map((item) => (
              <article className="education-row" key={`${item.degree}-${item.institution}`}>
                <span className="education-icon"><Icon name="graduation" size={20} /></span>
                <div><h4>{item.degree}</h4><p>{item.institution}</p><span>{item.dates}{item.location ? ` · ${item.location}` : ""}</span></div>
              </article>
            ))}
          </div>
        ) : <EmptyState title="Education will appear here" description="Add education details to your profile." />}
      </section>
    </>
  );
}

function EmptyState({ title, description, action, onClick }: { title: string; description: string; action?: string; onClick?: () => void }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="sparkles" size={20} /></span><h3>{title}</h3><p>{description}</p>{action && onClick && <button className="button button-outline" onClick={onClick}><Icon name="plus" size={15} /> {action}</button>}</div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button></div>{children}</section></div>;
}

export default App;

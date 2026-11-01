import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { createEmptyProfile, type Achievement, type Experience, type Profile, type View } from "./profile";
import { supabase } from "./supabase";
import { loadDemoProfile, normalizeProfile } from "./profileStorage";
import { getPathnameForView, getViewFromPathname } from "./routes";
import AchievementsSection from "./components/AchievementsSection";
import AuthScreen, { type AuthMode } from "./components/AuthScreen";
import ExperienceSection from "./components/ExperienceSection";
import Icon, { type IconName } from "./components/Icon";
import LoadingScreen from "./components/LoadingScreen";
import Modal from "./components/Modal";
import Overview from "./components/Overview";
import PersonalDetails from "./components/PersonalDetails";
import ProjectsEducationSection from "./components/ProjectsEducationSection";
import { Avatar } from "./components/ProfileUi";
import SkillsSection from "./components/SkillsSection";

const appEnvironment = import.meta.env.VITE_APP_ENV ?? "development";
const navigation: { label: View; icon: IconName }[] = [
  { label: "Overview", icon: "grid" },
  { label: "Personal details", icon: "user" },
  { label: "Experience", icon: "briefcase" },
  { label: "Skills", icon: "sparkles" },
  { label: "Achievements", icon: "award" },
  { label: "Projects & education", icon: "graduation" },
];

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
  const [activeView, setActiveView] = useState<View>(() => getViewFromPathname(window.location.pathname, import.meta.env.BASE_URL));
  const [modal, setModal] = useState<"personal" | "experience" | "achievement" | null>(null);
  const [toast, setToast] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    function handlePopState() {
      setActiveView(getViewFromPathname(window.location.pathname, import.meta.env.BASE_URL));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigateToView(view: View) {
    const pathname = getPathnameForView(view, import.meta.env.BASE_URL);
    if (window.location.pathname !== pathname) {
      window.history.pushState(null, "", pathname);
    }
    setActiveView(view);
  }
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

  async function handleAuth(event: FormEvent<HTMLFormElement>, mode: AuthMode) {
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
            onNavigate={navigateToView}
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
        <a className="brand" href={getPathnameForView("Overview", import.meta.env.BASE_URL)} onClick={(event) => { event.preventDefault(); navigateToView("Overview"); }}>
          <span className="brand-mark"><span /></span>
          <span>career<span className="brand-light">folio</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Profile sections">
          {navigation.map((item) => (
            <button key={item.label} className={`nav-item ${activeView === item.label ? "active" : ""}`} onClick={() => { navigateToView(item.label); setMobileNavOpen(false); }}>
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
            <button onClick={() => navigateToView("Overview")}>View profile tips <Icon name="chevron" size={14} /></button>
          </div>
          <button className="account-row" onClick={() => navigateToView("Personal details")}>
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
            <button className="top-avatar" onClick={() => navigateToView("Personal details")} aria-label="Open personal details"><Avatar name={profile.name} small /></button>
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

export default App;

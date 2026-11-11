import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { createEmptyProfile, demoProfile, type Profile, type View } from "./profile";
import { supabase } from "./supabase";
import { isValidLocalCredentials } from "./localAuth";
import { normalizeProfile } from "./profileStorage";
import { improveProfileText } from "./aiWriting";
import { toRecruiterProfile, type RecruiterProfile } from "./profileSharing";
import {
  getAuthPageFromPathname,
  getPathnameForAuthPage,
  getPathnameForPreview,
  getPathnameForSharedProfile,
  getPathnameForView,
  getSharedProfileTokenFromPathname,
  getViewFromPathname,
  isPreviewPathname,
  type AuthPage,
} from "./routes";
import AchievementsSection from "./components/AchievementsSection";
import AuthScreen from "./components/AuthScreen";
import ExperienceSection from "./components/ExperienceSection";
import Icon, { type IconName } from "./components/Icon";
import InlineProfileEditor from "./components/InlineProfileEditor";
import LoadingScreen from "./components/LoadingScreen";
import Overview from "./components/Overview";
import PersonalDetails from "./components/PersonalDetails";
import ProfileEditor from "./components/ProfileEditor";
import ProjectsEducationSection from "./components/ProjectsEducationSection";
import RecruiterProfilePage from "./components/RecruiterProfile";
import { Avatar } from "./components/ProfileUi";
import SkillsSection from "./components/SkillsSection";

const appEnvironment = import.meta.env.VITE_APP_ENV ?? "development";
const localAuthEnabled = import.meta.env.MODE === "development";
const localProfileStorageKey = "careerfolio.local-profile";
const navigation: { label: View; icon: IconName }[] = [
  { label: "Overview", icon: "grid" },
  { label: "Personal details", icon: "user" },
  { label: "Experience", icon: "briefcase" },
  { label: "Skills", icon: "sparkles" },
  { label: "Achievements", icon: "award" },
  { label: "Projects & education", icon: "graduation" },
];

function App() {
  const [profile, setProfile] = useState<Profile>(() => supabase ? createEmptyProfile("") : demoProfile);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [localAuthenticated, setLocalAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(!supabase);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authPage, setAuthPage] = useState<AuthPage | null>(() =>
    getAuthPageFromPathname(window.location.pathname, import.meta.env.BASE_URL),
  );
  const [profileReady, setProfileReady] = useState(!supabase);
  const [profileExists, setProfileExists] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaveBusy, setProfileSaveBusy] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState("");
  const [activeView, setActiveView] = useState<View>(() => getViewFromPathname(window.location.pathname, import.meta.env.BASE_URL));
  const [editingProfile, setEditingProfile] = useState(false);
  const [inlineEditingView, setInlineEditingView] = useState<View | null>(null);
  const [previewMode, setPreviewMode] = useState(() => isPreviewPathname(window.location.pathname, import.meta.env.BASE_URL));
  const [sharedProfileToken, setSharedProfileToken] = useState(() =>
    getSharedProfileTokenFromPathname(window.location.pathname, import.meta.env.BASE_URL),
  );
  const [sharedProfile, setSharedProfile] = useState<RecruiterProfile | null>(null);
  const [sharedProfileLoading, setSharedProfileLoading] = useState(() =>
    Boolean(getSharedProfileTokenFromPathname(window.location.pathname, import.meta.env.BASE_URL)),
  );
  const [sharedProfileError, setSharedProfileError] = useState("");
  const [shareToken, setShareToken] = useState("");
  const [shareActive, setShareActive] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isAuthenticated = supabase ? Boolean(authUser) : localAuthenticated;

  useEffect(() => {
    function handlePopState() {
      setActiveView(getViewFromPathname(window.location.pathname, import.meta.env.BASE_URL));
      setAuthPage(getAuthPageFromPathname(window.location.pathname, import.meta.env.BASE_URL));
      setPreviewMode(isPreviewPathname(window.location.pathname, import.meta.env.BASE_URL));
      setSharedProfileToken(getSharedProfileTokenFromPathname(window.location.pathname, import.meta.env.BASE_URL));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (sharedProfileToken) return;
    if (supabase && !authReady) return;

    const currentAuthPage = getAuthPageFromPathname(window.location.pathname, import.meta.env.BASE_URL);
    if (!isAuthenticated) {
      if (!currentAuthPage || (localAuthEnabled && currentAuthPage !== "login")) {
        window.history.replaceState(null, "", getPathnameForAuthPage("login", import.meta.env.BASE_URL));
        setAuthPage("login");
        setAuthError("");
      } else if (authPage !== currentAuthPage) {
        setAuthPage(currentAuthPage);
      }
      return;
    }

    if (authPage && authPage !== "reset-password") {
      window.history.replaceState(null, "", getPathnameForView("Overview", import.meta.env.BASE_URL));
      setActiveView("Overview");
      setAuthPage(null);
    }
  }, [authReady, authPage, isAuthenticated, sharedProfileToken]);

  function navigateToView(view: View) {
    const pathname = getPathnameForView(view, import.meta.env.BASE_URL);
    if (window.location.pathname !== pathname) {
      window.history.pushState(null, "", pathname);
    }
    setActiveView(view);
    setAuthPage(null);
    setPreviewMode(false);
    setSharedProfileToken(null);
    setAuthError("");
    setAuthMessage("");
    setInlineEditingView(null);
    setProfileSaveError("");
  }

  function navigateToAuthPage(page: AuthPage, replace = false) {
    const pathname = getPathnameForAuthPage(page, import.meta.env.BASE_URL);
    if (window.location.pathname !== pathname) {
      if (replace) {
        window.history.replaceState(null, "", pathname);
      } else {
        window.history.pushState(null, "", pathname);
      }
    }
    setAuthPage(page);
    setPreviewMode(false);
    setSharedProfileToken(null);
    setAuthError("");
    setAuthMessage("");
  }

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      const nextUser = session?.user ?? null;
      setAuthUser(nextUser);
      if (!nextUser) {
        setProfileError("");
        setProfileReady(true);
        setProfile(createEmptyProfile(""));
        setProfileExists(false);
        setShareToken("");
        setShareActive(false);
      }
      if (event === "PASSWORD_RECOVERY") navigateToAuthPage("reset-password");
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
    setProfileError("");

    void (async () => {
      try {
        const [profileResult, shareResult] = await Promise.all([
          supabase
          .from("profiles")
          .select("profile_data")
          .eq("user_id", authUser.id)
          .maybeSingle(),
          supabase
            .from("profile_shares")
            .select("share_token,is_active")
            .eq("user_id", authUser.id)
            .maybeSingle(),
        ]);
        if (profileResult.error) throw profileResult.error;
        if (shareResult.error) throw shareResult.error;
        if (!active) return;
        const fallback = createEmptyProfile(authUser.email ?? "");
        setProfile(profileResult.data ? normalizeProfile(profileResult.data.profile_data, fallback) : fallback);
        setProfileExists(Boolean(profileResult.data));
        setShareToken(shareResult.data?.share_token ?? "");
        setShareActive(Boolean(shareResult.data?.is_active));
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
    if (!sharedProfileToken) {
      setSharedProfile(null);
      setSharedProfileError("");
      setSharedProfileLoading(false);
      return;
    }
    if (!supabase) {
      setSharedProfileError("Shared profiles are available only in a Supabase-configured environment.");
      setSharedProfileLoading(false);
      return;
    }
    let active = true;
    setSharedProfileLoading(true);
    setSharedProfileError("");
    void (async () => {
      try {
        const { data, error } = await supabase.rpc("get_shared_profile", { p_share_token: sharedProfileToken });
        if (error) throw error;
        if (!active) return;
        if (!data) {
          setSharedProfile(null);
          setSharedProfileError("This profile is unavailable or sharing has been turned off.");
        } else {
          setSharedProfile(toRecruiterProfile(normalizeProfile(data, createEmptyProfile(""))));
        }
      } catch (error) {
        if (!active) return;
        console.error("Unable to load the shared profile.", error);
        setSharedProfile(null);
        setSharedProfileError("Unable to load this profile. Please try again later.");
      } finally {
        if (active) setSharedProfileLoading(false);
      }
    })();
    return () => { active = false; };
  }, [sharedProfileToken]);

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

  function showToast(message: string) {
    setToast(message);
  }

  function navigateToPreview() {
    const pathname = getPathnameForPreview(import.meta.env.BASE_URL);
    if (window.location.pathname !== pathname) window.history.pushState(null, "", pathname);
    setPreviewMode(true);
    setSharedProfileToken(null);
    setAuthPage(null);
    setEditingProfile(false);
  }

  async function handleSaveProfile(nextProfile: Profile, keepCurrentView = false) {
    setProfileSaveBusy(true);
    setProfileSaveError("");
    try {
      if (!supabase) {
        localStorage.setItem(localProfileStorageKey, JSON.stringify(nextProfile));
      } else {
        if (!authUser) throw new Error("Sign in again before saving your profile.");
        const { error } = await supabase.from("profiles").upsert(
          { user_id: authUser.id, profile_data: nextProfile },
          { onConflict: "user_id" },
        );
        if (error) throw error;
      }
      setProfile(nextProfile);
      setProfileExists(true);
      setEditingProfile(false);
      setInlineEditingView(null);
      setProfileSaveError("");
      if (!keepCurrentView) navigateToView("Overview");
    } catch (error) {
      console.error("Unable to save the profile.", error);
      const message = error instanceof Error ? error.message : "Unable to save your profile. Try again.";
      setProfileSaveError(message);
      throw new Error(message);
    } finally {
      setProfileSaveBusy(false);
    }
  }

  async function handleUploadResume(file: File) {
    if (!supabase || !authUser) {
      throw new Error("Resume uploads require a signed-in Supabase account. Use UAT or production to upload a resume.");
    }
    const allowedTypes = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);
    const allowedExtensions = /\.(pdf|doc|docx)$/i;
    if (file.size > 10 * 1024 * 1024) throw new Error("Resume files must be 10 MB or smaller.");
    if (!allowedTypes.has(file.type) && !allowedExtensions.test(file.name)) {
      throw new Error("Choose a PDF, DOC, or DOCX resume.");
    }
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${authUser.id}/${crypto.randomUUID()}-${safeFilename}`;
    const { error } = await supabase.storage.from("resumes").upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
    if (error) {
      console.error("Unable to upload the resume.", error);
      throw new Error(error.message);
    }
    return { resumePath: path, resumeName: file.name };
  }

  async function handleDownloadResume(profileToDownload: RecruiterProfile) {
    if (!supabase || !profileToDownload.resumePath) return;
    try {
      const { data, error } = await supabase.storage.from("resumes").createSignedUrl(profileToDownload.resumePath, 60);
      if (error) throw error;
      window.location.assign(data.signedUrl);
    } catch (error) {
      console.error("Unable to create a resume download link.", error);
      showToast("Resume is unavailable. The owner may have replaced it or disabled sharing.");
    }
  }

  async function handleShareProfile() {
    if (!supabase || !authUser) {
      showToast("Profile sharing requires a Supabase account.");
      return;
    }
    if (!profileExists) {
      showToast("Save your profile before sharing it.");
      return;
    }
    setShareBusy(true);
    try {
      const shareRequest = shareToken
        ? supabase.from("profile_shares").update({ is_active: true }).eq("user_id", authUser.id).select("share_token").single()
        : supabase.from("profile_shares").insert({ user_id: authUser.id, is_active: true }).select("share_token").single();
      const { data, error } = await shareRequest;
      if (error) throw error;
      const nextShareUrl = new URL(
        getPathnameForSharedProfile(data.share_token, import.meta.env.BASE_URL),
        window.location.origin,
      ).href;
      setShareToken(data.share_token);
      setShareActive(true);
      try {
        await navigator.clipboard.writeText(nextShareUrl);
        showToast("Share link copied. Anyone with it can view your profile.");
      } catch (error) {
        console.error("Unable to copy the profile share link.", error);
        showToast("Sharing is on. Copy the link shown on your profile to share it.");
      }
    } catch (error) {
      console.error("Unable to create the profile share link.", error);
      showToast(error instanceof Error ? `Couldn't create the share link: ${error.message}` : "Couldn't create the share link.");
    } finally {
      setShareBusy(false);
    }
  }

  async function handleStopSharing() {
    if (!supabase || !authUser) return;
    setShareBusy(true);
    try {
      const { error } = await supabase.from("profile_shares").update({ is_active: false }).eq("user_id", authUser.id);
      if (error) throw error;
      setShareActive(false);
      showToast("Profile sharing is off. Existing links no longer work.");
    } catch (error) {
      console.error("Unable to disable profile sharing.", error);
      showToast(error instanceof Error ? error.message : "Unable to disable profile sharing.");
    } finally {
      setShareBusy(false);
    }
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>, page: AuthPage) {
    event.preventDefault();
    if (!supabase) {
      if (!localAuthEnabled || page !== "login") {
        setAuthError("Authentication is not available for this page in the current environment.");
        return;
      }
      const form = new FormData(event.currentTarget);
      const username = String(form.get("username") ?? "");
      const password = String(form.get("password") ?? "");
      if (!isValidLocalCredentials(
        username,
        password,
        import.meta.env.VITE_LOCAL_AUTH_USERNAME ?? "",
        import.meta.env.VITE_LOCAL_AUTH_PASSWORD ?? "",
      )) {
        setAuthError("Username or password is incorrect.");
        return;
      }
      let savedProfile: Profile | null;
      try {
        const storedProfile = localStorage.getItem(localProfileStorageKey);
        savedProfile = storedProfile
          ? normalizeProfile(JSON.parse(storedProfile), createEmptyProfile(username))
          : null;
      } catch (error) {
        console.error("Unable to read the local profile.", error);
        setAuthError("Unable to load the local profile from this browser.");
        return;
      }
      setLocalAuthenticated(true);
      setProfile(savedProfile ?? createEmptyProfile(username));
      setProfileExists(Boolean(savedProfile));
      navigateToView("Overview");
      return;
    }
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setAuthBusy(true);
    setAuthError("");
    setAuthMessage("");
    try {
      if (page === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigateToView("Overview");
      } else if (page === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: new URL(getPathnameForView("Overview", import.meta.env.BASE_URL), window.location.origin).href,
          },
        });
        if (error) throw error;
        if (!data.session) {
          setAuthMessage("Check your email to confirm your account, then sign in.");
        } else {
          navigateToView("Overview");
        }
      } else if (page === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: new URL(getPathnameForAuthPage("reset-password", import.meta.env.BASE_URL), window.location.origin).href,
        });
        if (error) throw error;
        setAuthMessage("If an account exists for that email, a password reset link is on its way.");
      } else {
        const confirmPassword = String(form.get("confirmPassword") ?? "");
        if (password !== confirmPassword) {
          setAuthError("The passwords do not match.");
          return;
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setAuthMessage("Your password has been updated.");
        navigateToView("Overview");
      }
    } catch (error) {
      console.error("Supabase authentication failed.", error);
      setAuthError(error instanceof Error ? error.message : "Authentication failed. Try again.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    if (!supabase) {
      setLocalAuthenticated(false);
      setProfile(createEmptyProfile(""));
      setProfileExists(false);
      navigateToAuthPage("login", true);
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigateToAuthPage("login");
    } catch (error) {
      console.error("Unable to sign out of Supabase.", error);
      showToast("Unable to sign out. Try again.");
    }
  }

  function copyProfileLink() {
    void handleShareProfile();
  }

  const shareUrl = shareToken
    ? new URL(getPathnameForSharedProfile(shareToken, import.meta.env.BASE_URL), window.location.origin).href
    : "";

  function renderMain() {
    if (inlineEditingView === activeView) {
      return (
        <InlineProfileEditor
          section={activeView}
          profile={profile}
          busy={profileSaveBusy}
          error={profileSaveError}
          onSave={(nextProfile) => handleSaveProfile(nextProfile, true)}
          onImproveText={improveProfileText}
          onCancel={() => {
            setProfileSaveError("");
            setInlineEditingView(null);
          }}
        />
      );
    }

    const startInlineEdit = () => {
      setProfileSaveError("");
      setInlineEditingView(activeView);
    };

    switch (activeView) {
      case "Personal details":
        return <PersonalDetails profile={profile} onEdit={startInlineEdit} />;
      case "Experience":
        return <ExperienceSection experience={profile.experience} onEdit={startInlineEdit} />;
      case "Skills":
        return <SkillsSection skills={profile.skills} onEdit={startInlineEdit} />;
      case "Achievements":
        return <AchievementsSection achievements={profile.achievements} onEdit={startInlineEdit} />;
      case "Projects & education":
        return <ProjectsEducationSection projects={profile.projects} education={profile.education} onEdit={startInlineEdit} />;
      default:
        return (
          <Overview
            profile={profile}
            completion={completion}
            onNavigate={navigateToView}
            onCopy={copyProfileLink}
            onEdit={startInlineEdit}
          />
        );
    }
  }

  if (sharedProfileToken) {
    if (sharedProfileLoading) return <LoadingScreen message="Loading shared profile…" />;
    if (sharedProfile) {
      return (
        <RecruiterProfilePage
          profile={sharedProfile}
          onDownloadResume={() => void handleDownloadResume(sharedProfile)}
        />
      );
    }
    return (
      <main className="shared-profile-error">
        <a className="brand" href={import.meta.env.BASE_URL}><span className="brand-mark"><span /></span><span>career<span className="brand-light">folio</span></span></a>
        <h1>Profile unavailable</h1>
        <p>{sharedProfileError || "This profile is unavailable or sharing has been turned off."}</p>
      </main>
    );
  }
  if (supabase && !authReady) {
    return <LoadingScreen message="Connecting to your account…" />;
  }
  if (!isAuthenticated) {
    return (
      <AuthScreen
        page={authPage ?? "login"}
        configured={Boolean(supabase) || localAuthEnabled}
        localMode={localAuthEnabled}
        error={authError}
        message={authMessage}
        busy={authBusy}
        onNavigate={navigateToAuthPage}
        onSubmit={handleAuth}
      />
    );
  }
  if (authPage === "reset-password") {
    return (
      <AuthScreen
        page={authPage}
        configured={Boolean(supabase)}
        localMode={false}
        error={authError}
        message={authMessage}
        busy={authBusy}
        onNavigate={navigateToAuthPage}
        onSubmit={handleAuth}
      />
    );
  }
  if (supabase && authUser && profileError) {
    return <LoadingScreen message={profileError} action="Retry" onAction={() => window.location.reload()} />;
  }
  if (supabase && authUser && !profileReady) {
    return <LoadingScreen message="Loading your profile…" />;
  }
  if (previewMode) {
    return (
      <RecruiterProfilePage
        profile={toRecruiterProfile(profile)}
        ownerPreview
        onBack={() => navigateToView("Overview")}
        onDownloadResume={profile.resumePath ? () => void handleDownloadResume(toRecruiterProfile(profile)) : undefined}
      />
    );
  }
  if (!profileExists) {
    return (
      <main className="editor-page">
        <ProfileEditor
          initialProfile={profile}
          busy={profileSaveBusy}
          error={profileSaveError}
          firstTime
          cancelLabel="Sign out"
          onSave={handleSaveProfile}
          onImproveText={improveProfileText}
          onUploadResume={handleUploadResume}
          onCancel={() => void handleSignOut()}
        />
      </main>
    );
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
          {(supabase || localAuthEnabled) && <button className="logout-button" onClick={handleSignOut}>Sign out</button>}
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Icon name="menu" /></button>
          <div className="breadcrumb"><span>My profile</span><Icon name="chevron" size={14} /><strong>{editingProfile ? "Edit profile" : activeView}</strong></div>
          <div className="topbar-actions">
            <span className={`environment-badge environment-${appEnvironment}`}>{appEnvironment.toUpperCase()}</span>
            {!editingProfile && <>
              <button className="button button-outline profile-action" aria-label="Preview profile" onClick={navigateToPreview}>Preview</button>
              <button className="button button-outline profile-action" aria-label="Edit profile" onClick={() => { setInlineEditingView(null); setProfileSaveError(""); setEditingProfile(true); }}>Edit</button>
              <button className="button button-primary profile-action" aria-label={shareActive ? "Copy profile link" : "Share profile"} disabled={shareBusy} onClick={copyProfileLink}>{shareBusy ? "Please wait…" : shareActive ? "Copy link" : "Share"}</button>
              <button className="top-avatar" onClick={() => navigateToView("Personal details")} aria-label="Open personal details"><Avatar name={profile.name} small /></button>
            </>}
          </div>
        </header>
        <div className="content-wrap">
          {editingProfile ? (
            <div className="editor-page dashboard-profile-editor">
              <ProfileEditor
                initialProfile={profile}
                busy={profileSaveBusy}
                error={profileSaveError}
                firstTime={false}
                cancelLabel="Cancel"
                onSave={handleSaveProfile}
                onImproveText={improveProfileText}
                onUploadResume={handleUploadResume}
                onCancel={() => { setProfileSaveError(""); setEditingProfile(false); }}
              />
            </div>
          ) : (
            <>
              {shareActive && <div className="share-link-banner"><span>Anyone with this unlisted link can view your email{profile.resumePath ? " and download your resume" : ""}. Your phone number stays private.</span><input aria-label="Public profile link" readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} /><button className="button button-quiet profile-action" disabled={shareBusy} onClick={() => void handleStopSharing()}>Stop sharing</button></div>}
              {renderMain()}
              <footer className="page-footer">
                <span>© 2025 Careerfolio</span>
                <span><span className="privacy-dot" /> Only you can edit this profile</span>
                <button onClick={() => showToast("Help center coming soon.")}>Help center</button>
              </footer>
            </>
          )}
        </div>
      </main>
      {toast && <div className="toast" role="status"><span className="toast-check"><Icon name="check" size={15} /></span>{toast}</div>}
    </div>
  );
}

export default App;

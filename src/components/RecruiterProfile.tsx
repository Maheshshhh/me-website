import type { RecruiterProfile } from "../profileSharing";
import { Avatar } from "./ProfileUi";

type RecruiterProfileProps = {
  profile: RecruiterProfile;
  ownerPreview?: boolean;
  onBack?: () => void;
  onDownloadResume?: () => void;
};

function websiteUrl(value: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

export default function RecruiterProfile({ profile, ownerPreview = false, onBack, onDownloadResume }: RecruiterProfileProps) {
  const safeWebsite = websiteUrl(profile.website);
  return (
    <main className="recruiter-page">
      <header className="recruiter-topbar">
        <a className="brand" href={import.meta.env.BASE_URL}>
          <span className="brand-mark"><span /></span>
          <span>career<span className="brand-light">folio</span></span>
        </a>
        {ownerPreview && onBack && <button className="button button-outline" onClick={onBack}>Back to editor</button>}
      </header>
      <div className="recruiter-content">
        <p className="recruiter-kicker">{ownerPreview ? "RECRUITER PREVIEW" : "PROFESSIONAL PROFILE"}</p>
        <section className="recruiter-hero">
          <Avatar name={profile.name} />
          <div className="recruiter-identity">
            <h1>{profile.name || "Professional profile"}</h1>
            {profile.title && <p className="recruiter-title">{profile.title}</p>}
            {profile.location && <p className="recruiter-location">{profile.location}</p>}
            <div className="recruiter-contact">
              {profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
              {safeWebsite && <a href={safeWebsite} target="_blank" rel="noreferrer">Website / LinkedIn</a>}
            </div>
          </div>
        </section>

        {profile.summary && <section className="recruiter-section"><h2>About</h2><p className="recruiter-summary">{profile.summary}</p></section>}

        {profile.experience.length > 0 && <section className="recruiter-section"><h2>Experience</h2><div className="recruiter-list">
          {profile.experience.map((item, index) => <article className="recruiter-entry" key={`${item.company}-${index}`}>
            <div className="recruiter-entry-heading"><h3>{item.role}</h3><span>{item.dates}</span></div>
            <p className="recruiter-entry-subtitle">{item.company}</p>
            {item.description && <p>{item.description}</p>}
          </article>)}
        </div></section>}

        {profile.skills.length > 0 && <section className="recruiter-section"><h2>Skills</h2><div className="recruiter-skill-list">{profile.skills.map((skill) => <span className="recruiter-skill" key={skill}>{skill}</span>)}</div></section>}

        {profile.achievements.length > 0 && <section className="recruiter-section"><h2>Achievements</h2><div className="recruiter-list">
          {profile.achievements.map((item, index) => <article className="recruiter-entry" key={`${item.title}-${index}`}>
            <div className="recruiter-entry-heading"><h3>{item.title}</h3><span>{item.year}</span></div><p className="recruiter-entry-subtitle">{item.issuer}</p>
          </article>)}
        </div></section>}

        {profile.projects.length > 0 && <section className="recruiter-section"><h2>Projects</h2><div className="recruiter-list">
          {profile.projects.map((item, index) => <article className="recruiter-entry" key={`${item.title}-${index}`}>
            <div className="recruiter-entry-heading"><h3>{item.title}</h3><span>{item.domain}</span></div>{item.description && <p>{item.description}</p>}
          </article>)}
        </div></section>}

        {profile.education.length > 0 && <section className="recruiter-section"><h2>Education</h2><div className="recruiter-list">
          {profile.education.map((item, index) => <article className="recruiter-entry" key={`${item.institution}-${index}`}>
            <div className="recruiter-entry-heading"><h3>{item.degree}</h3><span>{item.dates}</span></div><p className="recruiter-entry-subtitle">{item.institution}{item.location ? ` · ${item.location}` : ""}</p>
          </article>)}
        </div></section>}

        {profile.resumePath && <section className="recruiter-section recruiter-resume"><div><h2>Resume</h2><p>{profile.resumeName || "Download resume"}</p></div><button className="button button-primary" type="button" onClick={onDownloadResume} disabled={!onDownloadResume}>Download resume</button></section>}
        <footer className="recruiter-footer">Shared with Careerfolio · Phone number is not displayed</footer>
      </div>
    </main>
  );
}

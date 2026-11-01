import type { Profile, View } from "../profile";
import Icon from "./Icon";
import { Avatar, CompletionItem, PageHeading } from "./ProfileUi";

type OverviewProps = {
  profile: Profile;
  completion: number;
  onNavigate: (view: View) => void;
  onEdit: () => void;
  onCopy: () => void;
  onAddExperience: () => void;
};

export default function Overview({ profile, completion, onNavigate, onEdit, onCopy, onAddExperience }: OverviewProps) {
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

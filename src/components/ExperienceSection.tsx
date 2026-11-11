import type { Experience } from "../profile";
import { EmptyState, PageHeading } from "./ProfileUi";

export default function ExperienceSection({ experience, onEdit }: { experience: Experience[]; onEdit: () => void }) {
  return (
    <>
      <PageHeading eyebrow="THE JOURNEY SO FAR" title="Experience" description="Showcase the work, teams, and moments that shaped your career." action={<button className="button button-outline" onClick={onEdit}>Edit</button>} />
      <section className="section-panel">
        <div className="section-panel-heading"><div><h3>Work history</h3><p>Your most recent roles and the impact you've made.</p></div><span className="count-pill">{experience.length} {experience.length === 1 ? "role" : "roles"}</span></div>
        {experience.length ? <div className="timeline full-timeline">{experience.map((item, index) => <div className="timeline-item" key={`${item.company}-${index}`}><span className="timeline-marker" /><div className="timeline-content"><div className="experience-title-row"><div><h4>{item.role}</h4><p className="company-line">{item.company}</p></div><div className="timeline-actions"><span className="date-label">{item.dates}</span></div></div><p className="experience-description">{item.description}</p></div></div>)}</div> : <EmptyState title="No experience listed" description="There are no experience entries to display." />}
      </section>
    </>
  );
}

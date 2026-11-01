import type { Experience } from "../profile";
import Icon from "./Icon";
import { EmptyState, PageHeading } from "./ProfileUi";

type ExperienceSectionProps = {
  experience: Experience[];
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export default function ExperienceSection({ experience, onAdd, onRemove }: ExperienceSectionProps) {
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

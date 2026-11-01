import type { Achievement } from "../profile";
import Icon from "./Icon";
import { EmptyState, PageHeading } from "./ProfileUi";

type AchievementsSectionProps = {
  achievements: Achievement[];
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export default function AchievementsSection({ achievements, onAdd, onRemove }: AchievementsSectionProps) {
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

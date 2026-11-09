import { EmptyState, PageHeading } from "./ProfileUi";

export default function SkillsSection({ skills }: { skills: string[] }) {
  return (
    <>
      <PageHeading eyebrow="WHAT YOU BRING" title="Skills & expertise" description="Give people a quick sense of what you're great at." />
      <section className="section-panel">
        <div className="section-panel-heading"><div><h3>Your skills</h3><p>Choose skills that reflect how you work and what you know.</p></div><span className="count-pill">{skills.length} skills</span></div>
        <div className="skill-list skill-list-large">{skills.map((skill) => <span className="skill-chip" key={skill}>{skill}</span>)}</div>
        {!skills.length && <EmptyState title="No skills listed" description="There are no skills to display." />}
      </section>
    </>
  );
}

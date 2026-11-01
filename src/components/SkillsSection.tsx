import type { FormEvent } from "react";
import Icon from "./Icon";
import { EmptyState, PageHeading } from "./ProfileUi";

type SkillsSectionProps = {
  skills: string[];
  onAdd: (event: FormEvent<HTMLFormElement>) => void;
  onRemove: (skill: string) => void;
};

export default function SkillsSection({ skills, onAdd, onRemove }: SkillsSectionProps) {
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

import type { Education, Project } from "../profile";
import Icon from "./Icon";
import { EmptyState, PageHeading } from "./ProfileUi";

type ProjectsEducationSectionProps = {
  projects: Project[];
  education: Education[];
  onEdit: () => void;
};

export default function ProjectsEducationSection({ projects, education, onEdit }: ProjectsEducationSectionProps) {
  return (
    <>
      <PageHeading eyebrow="SELECTED WORK & LEARNING" title="Projects & education" description="A snapshot of the domains you've worked in and the foundation behind your skills." action={<button className="button button-outline" onClick={onEdit}>Edit</button>} />
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
        ) : <EmptyState title="No projects listed" description="There are no projects to display." />}
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
        ) : <EmptyState title="No education listed" description="There are no education entries to display." />}
      </section>
    </>
  );
}

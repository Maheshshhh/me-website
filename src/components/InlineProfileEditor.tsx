import { useState, type FormEvent, type ReactNode } from "react";
import type { Achievement, Education, Experience, Profile, Project, View } from "../profile";

type InlineProfileEditorProps = {
  section: View;
  profile: Profile;
  busy: boolean;
  error: string;
  onSave: (profile: Profile) => Promise<void>;
  onCancel: () => void;
};

function updateItem<T>(items: T[], index: number, patch: Partial<T>): T[] {
  return items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);
}

function Field({ label, value, onChange, multiline = false, required = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  required?: boolean;
}) {
  return (
    <label className={multiline ? "editor-full" : ""}>
      {label}
      {multiline
        ? <textarea rows={4} maxLength={5000} value={value} onChange={(event) => onChange(event.target.value)} />
        : <input required={required} maxLength={2048} value={value} onChange={(event) => onChange(event.target.value)} />}
    </label>
  );
}

function Entry({ title, children, onRemove }: { title: string; children: ReactNode; onRemove: () => void }) {
  return (
    <fieldset className="editor-entry">
      <legend>{title}</legend>
      <button className="editor-remove" type="button" onClick={onRemove}>Remove</button>
      <div className="editor-grid">{children}</div>
    </fieldset>
  );
}

export default function InlineProfileEditor({ section, profile: initialProfile, busy, error, onSave, onCancel }: InlineProfileEditorProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [formError, setFormError] = useState("");

  function updateField<K extends keyof Profile>(field: K, value: Profile[K]) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    try {
      await onSave(profile);
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : "Unable to save your profile.");
    }
  }

  let title = "Edit profile";
  let fields: ReactNode;
  switch (section) {
    case "Overview":
      title = "Quick profile details";
      fields = (
        <>
          <Field label="Full name" value={profile.name} required onChange={(value) => updateField("name", value)} />
          <Field label="Professional headline" value={profile.title} onChange={(value) => updateField("title", value)} />
          <Field label="Location" value={profile.location} onChange={(value) => updateField("location", value)} />
          <Field label="Professional summary" multiline value={profile.summary} onChange={(value) => updateField("summary", value)} />
        </>
      );
      break;
    case "Personal details":
      title = "Personal details";
      fields = (
        <>
          <Field label="Full name" value={profile.name} required onChange={(value) => updateField("name", value)} />
          <Field label="Professional headline" value={profile.title} onChange={(value) => updateField("title", value)} />
          <Field label="Email address" value={profile.email} onChange={(value) => updateField("email", value)} />
          <Field label="Location" value={profile.location} onChange={(value) => updateField("location", value)} />
          <Field label="Website or LinkedIn" value={profile.website} onChange={(value) => updateField("website", value)} />
          <label>Phone number <span className="editor-help">(private; not shown in public previews)</span><input type="tel" maxLength={40} value={profile.phone} onChange={(event) => updateField("phone", event.target.value)} /></label>
          <Field label="Professional summary" multiline value={profile.summary} onChange={(value) => updateField("summary", value)} />
        </>
      );
      break;
    case "Experience":
      title = "Work experience";
      fields = (
        <>
          <div className="inline-editor-list-actions"><button className="button button-outline" type="button" onClick={() => updateField("experience", [...profile.experience, { role: "", company: "", dates: "", description: "" }])}>Add role</button></div>
          {profile.experience.map((item, index) => (
            <Entry key={`experience-${index}`} title={`Role ${index + 1}`} onRemove={() => updateField("experience", profile.experience.filter((_, itemIndex) => itemIndex !== index))}>
              <Field label="Job title" value={item.role} onChange={(value) => updateField("experience", updateItem<Experience>(profile.experience, index, { role: value }))} />
              <Field label="Company" value={item.company} onChange={(value) => updateField("experience", updateItem<Experience>(profile.experience, index, { company: value }))} />
              <Field label="Dates" value={item.dates} onChange={(value) => updateField("experience", updateItem<Experience>(profile.experience, index, { dates: value }))} />
              <Field label="Highlights" multiline value={item.description} onChange={(value) => updateField("experience", updateItem<Experience>(profile.experience, index, { description: value }))} />
            </Entry>
          ))}
          {!profile.experience.length && <p className="editor-empty">No roles added yet.</p>}
        </>
      );
      break;
    case "Skills":
      title = "Skills";
      fields = <Field label="Add one skill per line" multiline value={profile.skills.join("\n")} onChange={(value) => updateField("skills", value.split("\n").map((skill) => skill.trim()).filter(Boolean))} />;
      break;
    case "Achievements":
      title = "Achievements";
      fields = (
        <>
          <div className="inline-editor-list-actions"><button className="button button-outline" type="button" onClick={() => updateField("achievements", [...profile.achievements, { title: "", issuer: "", year: "" }])}>Add achievement</button></div>
          {profile.achievements.map((item, index) => (
            <Entry key={`achievement-${index}`} title={`Achievement ${index + 1}`} onRemove={() => updateField("achievements", profile.achievements.filter((_, itemIndex) => itemIndex !== index))}>
              <Field label="Title" value={item.title} onChange={(value) => updateField("achievements", updateItem<Achievement>(profile.achievements, index, { title: value }))} />
              <Field label="Issuer" value={item.issuer} onChange={(value) => updateField("achievements", updateItem<Achievement>(profile.achievements, index, { issuer: value }))} />
              <Field label="Year" value={item.year} onChange={(value) => updateField("achievements", updateItem<Achievement>(profile.achievements, index, { year: value }))} />
            </Entry>
          ))}
          {!profile.achievements.length && <p className="editor-empty">No achievements added yet.</p>}
        </>
      );
      break;
    case "Projects & education":
      title = "Projects & education";
      fields = (
        <>
          <div className="inline-editor-list-actions"><button className="button button-outline" type="button" onClick={() => updateField("projects", [...profile.projects, { title: "", domain: "", description: "" }])}>Add project</button></div>
          {profile.projects.map((item, index) => (
            <Entry key={`project-${index}`} title={`Project ${index + 1}`} onRemove={() => updateField("projects", profile.projects.filter((_, itemIndex) => itemIndex !== index))}>
              <Field label="Project name" value={item.title} onChange={(value) => updateField("projects", updateItem<Project>(profile.projects, index, { title: value }))} />
              <Field label="Industry or domain" value={item.domain} onChange={(value) => updateField("projects", updateItem<Project>(profile.projects, index, { domain: value }))} />
              <Field label="Description" multiline value={item.description} onChange={(value) => updateField("projects", updateItem<Project>(profile.projects, index, { description: value }))} />
            </Entry>
          ))}
          {!profile.projects.length && <p className="editor-empty">No projects added yet.</p>}
          <div className="inline-editor-list-actions"><strong>Education</strong><button className="button button-outline" type="button" onClick={() => updateField("education", [...profile.education, { degree: "", institution: "", dates: "", location: "" }])}>Add education</button></div>
          {profile.education.map((item, index) => (
            <Entry key={`education-${index}`} title={`Education ${index + 1}`} onRemove={() => updateField("education", profile.education.filter((_, itemIndex) => itemIndex !== index))}>
              <Field label="Degree" value={item.degree} onChange={(value) => updateField("education", updateItem<Education>(profile.education, index, { degree: value }))} />
              <Field label="Institution" value={item.institution} onChange={(value) => updateField("education", updateItem<Education>(profile.education, index, { institution: value }))} />
              <Field label="Dates" value={item.dates} onChange={(value) => updateField("education", updateItem<Education>(profile.education, index, { dates: value }))} />
              <Field label="Location" value={item.location} onChange={(value) => updateField("education", updateItem<Education>(profile.education, index, { location: value }))} />
            </Entry>
          ))}
          {!profile.education.length && <p className="editor-empty">No education added yet.</p>}
        </>
      );
      break;
  }

  return (
    <form className="section-panel editor-section inline-profile-editor" onSubmit={(event) => void handleSubmit(event)}>
      <div className="section-panel-heading">
        <div><h3>{title}</h3><p>Make changes here and save them to your profile.</p></div>
      </div>
      <div className="editor-grid">{fields}</div>
      {(formError || error) && <p className="auth-feedback auth-error" role="alert">{formError || error}</p>}
      <div className="inline-editor-actions">
        <button className="button button-outline" type="button" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
      </div>
    </form>
  );
}

import { useState, type FormEvent } from "react";
import type { Achievement, Education, Profile, Project } from "../profile";
import AiTextField, { type AiWritingKind } from "./AiTextField";
import { PageHeading } from "./ProfileUi";

type ResumeFile = { resumePath: string; resumeName: string };

type ProfileEditorProps = {
  initialProfile: Profile;
  busy: boolean;
  error: string;
  firstTime: boolean;
  cancelLabel: string;
  onSave: (profile: Profile) => Promise<void>;
  onImproveText: (kind: AiWritingKind, text: string) => Promise<string>;
  onUploadResume: (file: File) => Promise<ResumeFile>;
  onCancel: () => void;
};

function updateItem<T>(items: T[], index: number, patch: Partial<T>): T[] {
  return items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);
}

export default function ProfileEditor({
  initialProfile,
  busy,
  error,
  firstTime,
  cancelLabel,
  onSave,
  onImproveText,
  onUploadResume,
  onCancel,
}: ProfileEditorProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [formError, setFormError] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);

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

  async function handleResumeChange(file?: File) {
    if (!file) return;
    setFormError("");
    setUploadingResume(true);
    try {
      const resume = await onUploadResume(file);
      setProfile((current) => ({ ...current, ...resume }));
    } catch (uploadError) {
      setFormError(uploadError instanceof Error ? uploadError.message : "Unable to upload your resume.");
    } finally {
      setUploadingResume(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow={firstTime ? "YOUR PROFESSIONAL PROFILE" : "PROFILE SETTINGS"}
        title={firstTime ? "Build your profile" : "Edit your profile"}
        description={firstTime
          ? "Add the details you want recruiters to see. You can update your profile any time."
          : "Update the details recruiters see on your profile."}
        action={<button className="button button-outline" type="button" onClick={onCancel} disabled={busy}>{cancelLabel}</button>}
      />
      <form className="profile-editor" onSubmit={(event) => void handleSubmit(event)}>
        <section className="section-panel editor-section">
          <div className="section-panel-heading"><div><h3>Personal details</h3><p>Start with the essentials recruiters need to know.</p></div></div>
          <div className="editor-grid">
            <label>Full name<input required maxLength={120} value={profile.name} onChange={(event) => updateField("name", event.target.value)} /></label>
            <label>Professional headline<input maxLength={160} placeholder="e.g. Senior Frontend Engineer" value={profile.title} onChange={(event) => updateField("title", event.target.value)} /></label>
            <label>Email address<input type="email" maxLength={254} value={profile.email} onChange={(event) => updateField("email", event.target.value)} /></label>
            <label>Location<input maxLength={120} placeholder="City, Country" value={profile.location} onChange={(event) => updateField("location", event.target.value)} /></label>
            <label>Website or LinkedIn<input maxLength={2048} placeholder="linkedin.com/in/yourname" value={profile.website} onChange={(event) => updateField("website", event.target.value)} /></label>
            <label>Phone number <span className="editor-help">(private; not shown in public previews)</span><input type="tel" maxLength={40} value={profile.phone} onChange={(event) => updateField("phone", event.target.value)} /></label>
            <AiTextField label="Professional summary" kind="summary" rows={5} maxLength={5000} value={profile.summary} onChange={(value) => updateField("summary", value)} onImprove={onImproveText} />
          </div>
        </section>

        <section className="section-panel editor-section">
          <div className="section-panel-heading"><div><h3>Skills</h3><p>Add one skill per line.</p></div></div>
          <label>Skills<textarea rows={5} maxLength={5000} placeholder={"React\nTypeScript\nProduct design"} value={profile.skills.join("\n")} onChange={(event) => updateField("skills", event.target.value.split("\n").map((skill) => skill.trim()).filter(Boolean))} /></label>
        </section>

        <section className="section-panel editor-section">
          <div className="section-panel-heading"><div><h3>Work experience</h3><p>Include roles, organizations, dates, and impact.</p></div><button className="button button-outline" type="button" onClick={() => updateField("experience", [...profile.experience, { role: "", company: "", dates: "", description: "" }])}>Add role</button></div>
          {profile.experience.map((item, index) => (
            <fieldset className="editor-entry" key={`experience-${index}`}>
              <legend>Role {index + 1}</legend>
              <button className="editor-remove" type="button" aria-label={`Remove role ${index + 1}`} onClick={() => updateField("experience", profile.experience.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
              <div className="editor-grid">
                <label>Job title<input maxLength={160} value={item.role} onChange={(event) => updateField("experience", updateItem(profile.experience, index, { role: event.target.value }))} /></label>
                <label>Company<input maxLength={160} value={item.company} onChange={(event) => updateField("experience", updateItem(profile.experience, index, { company: event.target.value }))} /></label>
                <label>Dates<input maxLength={100} placeholder="Jan 2022 – Present" value={item.dates} onChange={(event) => updateField("experience", updateItem(profile.experience, index, { dates: event.target.value }))} /></label>
                <AiTextField label="Highlights" kind="experience" rows={3} maxLength={3000} value={item.description} onChange={(value) => updateField("experience", updateItem(profile.experience, index, { description: value }))} onImprove={onImproveText} />
              </div>
            </fieldset>
          ))}
          {profile.experience.length === 0 && <p className="editor-empty">No roles added yet.</p>}
        </section>

        <section className="section-panel editor-section">
          <div className="section-panel-heading"><div><h3>Achievements</h3><p>Certifications, awards, and other highlights.</p></div><button className="button button-outline" type="button" onClick={() => updateField("achievements", [...profile.achievements, { title: "", issuer: "", year: "" }])}>Add achievement</button></div>
          {profile.achievements.map((item, index) => (
            <EntryFields
              key={`achievement-${index}`}
              title={`Achievement ${index + 1}`}
              onRemove={() => updateField("achievements", profile.achievements.filter((_, itemIndex) => itemIndex !== index))}
              fields={[
                { label: "Title", value: item.title, onChange: (value) => updateField("achievements", updateItem<Achievement>(profile.achievements, index, { title: value })) },
                { label: "Issuer", value: item.issuer, onChange: (value) => updateField("achievements", updateItem<Achievement>(profile.achievements, index, { issuer: value })) },
                { label: "Year", value: item.year, onChange: (value) => updateField("achievements", updateItem<Achievement>(profile.achievements, index, { year: value })) },
              ]}
            />
          ))}
          {profile.achievements.length === 0 && <p className="editor-empty">No achievements added yet.</p>}
        </section>

        <section className="section-panel editor-section">
          <div className="section-panel-heading"><div><h3>Projects</h3><p>Showcase selected work and its impact.</p></div><button className="button button-outline" type="button" onClick={() => updateField("projects", [...profile.projects, { title: "", domain: "", description: "" }])}>Add project</button></div>
          {profile.projects.map((item, index) => (
            <EntryFields
              key={`project-${index}`}
              title={`Project ${index + 1}`}
              onRemove={() => updateField("projects", profile.projects.filter((_, itemIndex) => itemIndex !== index))}
              fields={[
                { label: "Project name", value: item.title, onChange: (value) => updateField("projects", updateItem<Project>(profile.projects, index, { title: value })) },
                { label: "Industry or domain", value: item.domain, onChange: (value) => updateField("projects", updateItem<Project>(profile.projects, index, { domain: value })) },
                { label: "Description", value: item.description, multiline: true, onChange: (value) => updateField("projects", updateItem<Project>(profile.projects, index, { description: value })) },
              ]}
            />
          ))}
          {profile.projects.length === 0 && <p className="editor-empty">No projects added yet.</p>}
        </section>

        <section className="section-panel editor-section">
          <div className="section-panel-heading"><div><h3>Education</h3><p>Add your degrees, schools, and dates.</p></div><button className="button button-outline" type="button" onClick={() => updateField("education", [...profile.education, { degree: "", institution: "", dates: "", location: "" }])}>Add education</button></div>
          {profile.education.map((item, index) => (
            <EntryFields
              key={`education-${index}`}
              title={`Education ${index + 1}`}
              onRemove={() => updateField("education", profile.education.filter((_, itemIndex) => itemIndex !== index))}
              fields={[
                { label: "Degree or qualification", value: item.degree, onChange: (value) => updateField("education", updateItem<Education>(profile.education, index, { degree: value })) },
                { label: "Institution", value: item.institution, onChange: (value) => updateField("education", updateItem<Education>(profile.education, index, { institution: value })) },
                { label: "Dates", value: item.dates, onChange: (value) => updateField("education", updateItem<Education>(profile.education, index, { dates: value })) },
                { label: "Location", value: item.location, onChange: (value) => updateField("education", updateItem<Education>(profile.education, index, { location: value })) },
              ]}
            />
          ))}
          {profile.education.length === 0 && <p className="editor-empty">No education added yet.</p>}
        </section>

        <section className="section-panel editor-section">
          <div className="section-panel-heading"><div><h3>Resume</h3><p>Upload a PDF, DOC, or DOCX up to 10 MB. It will be downloadable from an active shared profile link.</p></div></div>
          {profile.resumeName && <p className="resume-current">Current file: <strong>{profile.resumeName}</strong> <button className="text-link" type="button" onClick={() => setProfile((current) => ({ ...current, resumeName: "", resumePath: "" }))}>Remove</button></p>}
          <label className="resume-upload">Upload resume<input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" disabled={uploadingResume || busy} onChange={(event) => { void handleResumeChange(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
          {uploadingResume && <p className="editor-help">Uploading resume…</p>}
        </section>

        {(formError || error) && <p className="auth-feedback auth-error" role="alert">{formError || error}</p>}
        <div className="editor-footer">
          <p>Only you can edit your saved profile. Phone number is excluded from recruiter previews.</p>
          <button className="button button-primary" type="submit" disabled={busy || uploadingResume}>{busy ? "Saving…" : "Save profile"}</button>
        </div>
      </form>
    </>
  );
}

type EntryField = {
  label: string;
  value: string;
  multiline?: boolean;
  onChange: (value: string) => void;
};

function EntryFields({ title, fields, onRemove }: { title: string; fields: EntryField[]; onRemove: () => void }) {
  return (
    <fieldset className="editor-entry">
      <legend>{title}</legend>
      <button className="editor-remove" type="button" onClick={onRemove}>Remove</button>
      <div className="editor-grid">
        {fields.map((field) => (
          <label className={field.multiline ? "editor-full" : ""} key={field.label}>
            {field.label}
            {field.multiline
              ? <textarea rows={3} maxLength={3000} value={field.value} onChange={(event) => field.onChange(event.target.value)} />
              : <input maxLength={160} value={field.value} onChange={(event) => field.onChange(event.target.value)} />}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

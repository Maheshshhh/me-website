import { demoProfile, type Profile } from "./profile";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeProfile(value: unknown, fallback: Profile): Profile {
  if (!isRecord(value)) return fallback;
  const text = (key: keyof Profile, defaultValue: string) =>
    typeof value[key] === "string" ? value[key] as string : defaultValue;
  const skills = Array.isArray(value.skills) ? value.skills.filter((item): item is string => typeof item === "string") : fallback.skills;
  const experience = Array.isArray(value.experience)
    ? value.experience.filter(isRecord).map((item) => ({
      role: typeof item.role === "string" ? item.role : "",
      company: typeof item.company === "string" ? item.company : "",
      dates: typeof item.dates === "string" ? item.dates : "",
      description: typeof item.description === "string" ? item.description : "",
    }))
    : fallback.experience;
  const projects = Array.isArray(value.projects)
    ? value.projects.filter(isRecord).map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      domain: typeof item.domain === "string" ? item.domain : "",
      description: typeof item.description === "string" ? item.description : "",
    }))
    : fallback.projects;
  const education = Array.isArray(value.education)
    ? value.education.filter(isRecord).map((item) => ({
      degree: typeof item.degree === "string" ? item.degree : "",
      institution: typeof item.institution === "string" ? item.institution : "",
      dates: typeof item.dates === "string" ? item.dates : "",
      location: typeof item.location === "string" ? item.location : "",
    }))
    : fallback.education;
  const achievements = Array.isArray(value.achievements)
    ? value.achievements.filter(isRecord).map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      issuer: typeof item.issuer === "string" ? item.issuer : "",
      year: typeof item.year === "string" ? item.year : "",
    }))
    : fallback.achievements;
  return {
    name: text("name", fallback.name),
    title: text("title", fallback.title),
    location: text("location", fallback.location),
    email: text("email", fallback.email),
    phone: text("phone", fallback.phone),
    website: text("website", fallback.website),
    summary: text("summary", fallback.summary),
    skills,
    experience,
    achievements,
    projects,
    education,
    resumeName: text("resumeName", fallback.resumeName),
    resumePath: text("resumePath", fallback.resumePath ?? ""),
  };
}

export function loadDemoProfile(): Profile {
  try {
    const saved = localStorage.getItem("careerfolio-profile-mahesh-v1");
    return saved ? normalizeProfile(JSON.parse(saved), demoProfile) : demoProfile;
  } catch (error) {
    console.error("Unable to load the saved profile.", error);
    return demoProfile;
  }
}

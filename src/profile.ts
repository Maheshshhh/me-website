export type View = "Overview" | "Personal details" | "Experience" | "Skills" | "Achievements" | "Resume";

export type Experience = {
  role: string;
  company: string;
  dates: string;
  description: string;
};

export type Achievement = {
  title: string;
  issuer: string;
  year: string;
};

export type Profile = {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  achievements: Achievement[];
  resumeName: string;
  resumePath?: string;
};

export const demoProfile: Profile = {
  name: "Alex Morgan",
  title: "Product Designer",
  location: "Brooklyn, New York",
  email: "alex.morgan@email.com",
  phone: "+1 (555) 012-3456",
  website: "alexmorgan.design",
  summary:
    "I turn complex problems into clear, thoughtful experiences. Over the past 8 years, I've partnered with curious teams to build products that make everyday work feel a little easier.",
  skills: ["Product design", "Design systems", "Prototyping", "Figma", "User research", "Accessibility"],
  experience: [
    {
      role: "Senior Product Designer",
      company: "Linear",
      dates: "2022 — Present",
      description: "Leading product design for collaboration workflows, from early research through polished, shipped experiences.",
    },
    {
      role: "Product Designer",
      company: "Webflow",
      dates: "2019 — 2022",
      description: "Designed intuitive tools that helped creators bring their ideas to the web.",
    },
    {
      role: "UX Designer",
      company: "Northstar Studio",
      dates: "2017 — 2019",
      description: "Worked with cross-functional teams to shape digital products for early-stage companies.",
    },
  ],
  achievements: [
    { title: "Awwwards Honorable Mention", issuer: "Awwwards", year: "2023" },
    { title: "Certified Usability Analyst", issuer: "HFI", year: "2021" },
  ],
  resumeName: "Alex_Morgan_Resume.pdf",
};

export function createEmptyProfile(email: string): Profile {
  return {
    name: email.split("@")[0]?.replace(/[._-]+/g, " ") ?? "",
    title: "",
    location: "",
    email,
    phone: "",
    website: "",
    summary: "",
    skills: [],
    experience: [],
    achievements: [],
    resumeName: "",
  };
}

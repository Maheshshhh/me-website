export type View = "Overview" | "Personal details" | "Experience" | "Skills" | "Achievements" | "Projects & education";

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

export type Project = {
  title: string;
  domain: string;
  description: string;
};

export type Education = {
  degree: string;
  institution: string;
  dates: string;
  location: string;
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
  projects: Project[];
  education: Education[];
  resumeName: string;
  resumePath?: string;
};

export const demoProfile: Profile = {
  name: "Mahesh Shinde",
  title: "React JS Developer",
  location: "Pune, India",
  email: "28mahesh7@gmail.com",
  phone: "",
  website: "linkedin.com/in/maheshshh",
  summary:
    "Senior Front End Developer with 5+ years of experience specializing in React.js. Strong expertise in UI/UX implementation, API integration, Redux state management, performance optimization, and responsive design. Currently working in investment banking, delivering production-ready solutions in Agile Scrum environments with cross-functional teams.",
  skills: [
    "React.js",
    "JavaScript (ES6+)",
    "TypeScript",
    "Redux",
    "React Native",
    "Context API",
    "Material UI",
    "React Hooks",
    "HTML5",
    "CSS3",
    "Webpack",
    "REST APIs",
    "Jest",
    "Git",
    "GitHub",
    "GitLab",
    "Postman",
    "Chrome DevTools",
    "Xcode",
    "Gradle",
    "Jira",
    "Confluence",
    "Azure DevOps",
    "CI/CD",
    "Responsive design",
    "Performance optimization",
  ],
  experience: [
    {
      role: "Senior Analyst",
      company: "Northern Trust",
      dates: "Sep 2024 — Present",
      description: "Owned end-to-end migration from legacy APIs to new services across UI modules without impacting user experience. Optimized React component rendering and built a reusable component library shared across teams. Work in a shared monorepo, integrate REST APIs, and collaborate with stakeholders on technical decisions.",
    },
    {
      role: "Associate",
      company: "Cognizant Technology Solutions",
      dates: "Oct 2021 — Sep 2024",
      description: "Developed a single-codebase application supporting multiple global tenants, using feature flags to tailor market experiences. Built responsive mobile-first UI, improved cross-browser compatibility, wrote Jest unit tests, and used GitHub Copilot to accelerate development.",
    },
  ],
  achievements: [],
  projects: [
    {
      title: "Investment Banking Applications",
      domain: "Investment Banking / Financial Services",
      description: "React applications for managing investment accounts, portfolios, and transaction workflows.",
    },
    {
      title: "Food Ordering Application",
      domain: "Food & Retail Technology",
      description: "A large-scale digital ordering platform delivered as a React Native cross-platform mobile app and React.js progressive web app, supporting multi-tenant restaurant operations across global markets.",
    },
    {
      title: "Field Service Management Applications",
      domain: "Enterprise Mobility / Field Operations",
      description: "A React Native mobile application for field engineers to manage service requests, tool orders, and on-site operations.",
    },
  ],
  education: [
    {
      degree: "Bachelor of Engineering (BE)",
      institution: "Sanjivani College of Engineering, Savitribai Phule Pune University",
      dates: "2017 — 2021",
      location: "Kopargaon, India",
    },
  ],
  resumeName: "",
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
    projects: [],
    education: [],
    resumeName: "",
  };
}

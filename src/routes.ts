import type { View } from "./profile";

const viewPaths: Record<View, string> = {
  Overview: "",
  "Personal details": "personal-details",
  Experience: "experience",
  Skills: "skills",
  Achievements: "achievements",
  "Projects & education": "projects-education",
};

function getBasePath(baseUrl: string): string {
  const normalized = `/${baseUrl.split("/").filter(Boolean).join("/")}`;
  return normalized === "/" ? "/" : `${normalized}/`;
}

export function getPathnameForView(view: View, baseUrl: string): string {
  const basePath = getBasePath(baseUrl);
  const viewPath = viewPaths[view];
  return viewPath ? `${basePath}${viewPath}` : basePath;
}

export function getViewFromPathname(pathname: string, baseUrl: string): View {
  const basePath = getBasePath(baseUrl);
  const normalizedPathname = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const route = normalizedPathname.startsWith(basePath)
    ? normalizedPathname.slice(basePath.length).replace(/\/$/, "")
    : "";
  return (Object.keys(viewPaths) as View[]).find((view) => viewPaths[view] === route) ?? "Overview";
}

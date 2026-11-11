import type { View } from "./profile";

export type AuthPage = "login" | "signup" | "forgot-password" | "reset-password";
const shareTokenPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const viewPaths: Record<View, string> = {
  Overview: "",
  "Personal details": "personal-details",
  Experience: "experience",
  Skills: "skills",
  Achievements: "achievements",
  "Projects & education": "projects-education",
};

const authPagePaths: Record<AuthPage, string> = {
  login: "login",
  signup: "signup",
  "forgot-password": "forgot-password",
  "reset-password": "reset-password",
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

export function getPathnameForAuthPage(page: AuthPage, baseUrl: string): string {
  return `${getBasePath(baseUrl)}${authPagePaths[page]}`;
}

export function getPathnameForPreview(baseUrl: string): string {
  return `${getBasePath(baseUrl)}preview`;
}

export function getPathnameForSharedProfile(token: string, baseUrl: string): string {
  if (!shareTokenPattern.test(token)) throw new Error("Invalid profile share token.");
  return `${getBasePath(baseUrl)}p/${token}`;
}

export function getSharedProfileTokenFromPathname(pathname: string, baseUrl: string): string | null {
  const basePath = getBasePath(baseUrl);
  const normalizedPathname = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const route = normalizedPathname.startsWith(basePath)
    ? normalizedPathname.slice(basePath.length).replace(/\/$/, "")
    : "";
  const match = route.match(/^p\/([0-9a-f-]{36})$/i);
  return match && shareTokenPattern.test(match[1]) ? match[1] : null;
}

export function isPreviewPathname(pathname: string, baseUrl: string): boolean {
  const basePath = getBasePath(baseUrl);
  const normalizedPathname = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return normalizedPathname === `${basePath}preview/`;
}

export function getAuthPageFromPathname(pathname: string, baseUrl: string): AuthPage | null {
  const basePath = getBasePath(baseUrl);
  const normalizedPathname = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const route = normalizedPathname.startsWith(basePath)
    ? normalizedPathname.slice(basePath.length).replace(/\/$/, "")
    : "";
  return (Object.keys(authPagePaths) as AuthPage[]).find((page) => authPagePaths[page] === route) ?? null;
}

export function getViewFromPathname(pathname: string, baseUrl: string): View {
  const basePath = getBasePath(baseUrl);
  const normalizedPathname = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const route = normalizedPathname.startsWith(basePath)
    ? normalizedPathname.slice(basePath.length).replace(/\/$/, "")
    : "";
  return (Object.keys(viewPaths) as View[]).find((view) => viewPaths[view] === route) ?? "Overview";
}

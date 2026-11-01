import { describe, expect, it } from "vitest";
import type { View } from "./profile";
import { getPathnameForView, getViewFromPathname } from "./routes";

describe("profile section paths", () => {
  it.each([
    ["Overview", "/"],
    ["Personal details", "/personal-details"],
    ["Experience", "/experience"],
    ["Skills", "/skills"],
    ["Achievements", "/achievements"],
    ["Projects & education", "/projects-education"],
  ] satisfies [View, string][])("maps %s to a pathname in local development", (view, pathname) => {
    expect(getPathnameForView(view, "/")).toBe(pathname);
    expect(getViewFromPathname(pathname, "/")).toBe(view);
  });

  it.each([
    ["/me-website/", "/me-website/experience"],
    ["/me-website/uat/", "/me-website/uat/projects-education"],
  ])("preserves the deployment base path %s", (basePath, pathname) => {
    const view = basePath.includes("/uat/") ? "Projects & education" : "Experience";

    expect(getPathnameForView(view, basePath)).toBe(pathname);
    expect(getViewFromPathname(pathname, basePath)).toBe(view);
  });

  it("treats a trailing slash as the same section path", () => {
    expect(getViewFromPathname("/experience/", "/")).toBe("Experience");
  });

  it("falls back to overview for an unknown route", () => {
    expect(getViewFromPathname("/unknown-section", "/")).toBe("Overview");
  });
});

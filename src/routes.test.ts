import { describe, expect, it } from "vitest";
import type { View } from "./profile";
import {
  getAuthPageFromPathname,
  getPathnameForAuthPage,
  getPathnameForPreview,
  getPathnameForSharedProfile,
  getPathnameForView,
  getSharedProfileTokenFromPathname,
  getViewFromPathname,
  isPreviewPathname,
  type AuthPage,
} from "./routes";

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

  describe("authentication page paths", () => {
    it.each([
      ["login", "/login"],
      ["signup", "/signup"],
      ["forgot-password", "/forgot-password"],
      ["reset-password", "/reset-password"],
    ] satisfies [AuthPage, string][])("maps %s to a pathname in local development", (page, pathname) => {
      expect(getPathnameForAuthPage(page, "/")).toBe(pathname);
      expect(getAuthPageFromPathname(pathname, "/")).toBe(page);
    });

    it.each([
      ["/me-website/", "/login", "/me-website/login"],
      ["/me-website/uat/", "/reset-password", "/me-website/uat/reset-password"],
    ])("preserves the deployment base path for auth routes", (basePath, route, pathname) => {
      const page = route === "/login" ? "login" : "reset-password";

      expect(getPathnameForAuthPage(page, basePath)).toBe(pathname);
      expect(getAuthPageFromPathname(pathname, basePath)).toBe(page);
    });

    it("returns null for paths that are not authentication pages", () => {
      expect(getAuthPageFromPathname("/experience", "/")).toBeNull();
    });
  });

  it("builds and parses owner preview and shared-profile routes", () => {
    const token = "123e4567-e89b-12d3-a456-426614174000";

    expect(getPathnameForPreview("/me-website/uat/")).toBe("/me-website/uat/preview");
    expect(isPreviewPathname("/me-website/uat/preview", "/me-website/uat/")).toBe(true);
    expect(getPathnameForSharedProfile(token, "/me-website/uat/")).toBe(`/me-website/uat/p/${token}`);
    expect(getSharedProfileTokenFromPathname(`/me-website/uat/p/${token}`, "/me-website/uat/")).toBe(token);
    expect(getSharedProfileTokenFromPathname("/me-website/uat/p/not-a-token", "/me-website/uat/")).toBeNull();
  });

  it("rejects malformed tokens when building a share URL", () => {
    expect(() => getPathnameForSharedProfile("invalid", "/")).toThrow("Invalid profile share token.");
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

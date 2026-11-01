import { afterEach, describe, expect, it, vi } from "vitest";
import { demoProfile } from "./profile";
import { loadDemoProfile, normalizeProfile } from "./profileStorage";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("normalizeProfile", () => {
  it.each([null, undefined, "profile", 42, [], ["profile"]])(
    "returns the fallback when the saved value is not a profile record (%s)",
    (value) => {
      expect(normalizeProfile(value, demoProfile)).toBe(demoProfile);
    },
  );

  it("uses saved scalar values and falls back for values of the wrong type", () => {
    const profile = normalizeProfile(
      { name: "Alex Morgan", email: 123, phone: null, website: "example.com" },
      demoProfile,
    );

    expect(profile.name).toBe("Alex Morgan");
    expect(profile.email).toBe(demoProfile.email);
    expect(profile.phone).toBe(demoProfile.phone);
    expect(profile.website).toBe("example.com");
    expect(profile.summary).toBe(demoProfile.summary);
  });

  it("filters invalid skills and normalizes profile collections", () => {
    const profile = normalizeProfile(
      {
        skills: ["TypeScript", 42, null],
        experience: [{ role: "Engineer", company: 5 }],
        projects: [{ title: "Portal", domain: "Web", description: null }],
        education: [{ degree: "BS", institution: "College" }],
        achievements: [{ title: "Award", year: 2025 }],
      },
      demoProfile,
    );

    expect(profile.skills).toEqual(["TypeScript"]);
    expect(profile.experience).toEqual([{ role: "Engineer", company: "", dates: "", description: "" }]);
    expect(profile.projects).toEqual([{ title: "Portal", domain: "Web", description: "" }]);
    expect(profile.education).toEqual([{ degree: "BS", institution: "College", dates: "", location: "" }]);
    expect(profile.achievements).toEqual([{ title: "Award", issuer: "", year: "" }]);
  });

  it("uses fallback collections when a saved collection is not an array", () => {
    const profile = normalizeProfile({ skills: "TypeScript", experience: null }, demoProfile);

    expect(profile.skills).toBe(demoProfile.skills);
    expect(profile.experience).toBe(demoProfile.experience);
  });
});

describe("loadDemoProfile", () => {
  it("returns the demo profile when browser storage has no saved profile", () => {
    vi.stubGlobal("localStorage", { getItem: vi.fn().mockReturnValue(null) });

    expect(loadDemoProfile()).toBe(demoProfile);
    expect(localStorage.getItem).toHaveBeenCalledWith("careerfolio-profile-mahesh-v1");
  });

  it("loads and normalizes a saved profile", () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn().mockReturnValue(JSON.stringify({ name: "Alex Morgan", skills: ["React"] })),
    });

    const profile = loadDemoProfile();

    expect(profile.name).toBe("Alex Morgan");
    expect(profile.skills).toEqual(["React"]);
    expect(profile.experience).toEqual(demoProfile.experience);
  });

  it("logs invalid saved JSON and returns the demo profile", () => {
    vi.stubGlobal("localStorage", { getItem: vi.fn().mockReturnValue("{invalid json") });
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(loadDemoProfile()).toBe(demoProfile);
    expect(error).toHaveBeenCalledWith("Unable to load the saved profile.", expect.any(SyntaxError));
  });

  it("logs unavailable browser storage and returns the demo profile", () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => {
        throw new Error("Storage is unavailable");
      }),
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(loadDemoProfile()).toBe(demoProfile);
    expect(error).toHaveBeenCalledWith("Unable to load the saved profile.", expect.any(Error));
  });
});

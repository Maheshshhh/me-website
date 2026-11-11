import { describe, expect, it } from "vitest";
import { demoProfile } from "./profile";
import { toRecruiterProfile } from "./profileSharing";

describe("toRecruiterProfile", () => {
  it("includes recruiter details but excludes the phone number", () => {
    const profile = { ...demoProfile, phone: "+1-555-0100" };
    const recruiterProfile = toRecruiterProfile(profile);

    expect(recruiterProfile.email).toBe(profile.email);
    expect(recruiterProfile.resumePath).toBe(profile.resumePath);
    expect(recruiterProfile).not.toHaveProperty("phone");
  });
});

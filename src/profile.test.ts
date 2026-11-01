import { describe, expect, it } from "vitest";
import { createEmptyProfile, demoProfile } from "./profile";

describe("createEmptyProfile", () => {
  it("uses the email prefix as a readable name", () => {
    expect(createEmptyProfile("alex.morgan@example.com").name).toBe("alex morgan");
  });

  it("starts without personal contact or resume details", () => {
    const profile = createEmptyProfile("alex@example.com");

    expect(profile.email).toBe("alex@example.com");
    expect(profile.phone).toBe("");
    expect(profile.resumeName).toBe("");
    expect(profile.resumePath).toBeUndefined();
  });

  it("keeps the demo phone number and resume hidden", () => {
    expect(demoProfile.phone).toBe("");
    expect(demoProfile.resumeName).toBe("");
  });
});

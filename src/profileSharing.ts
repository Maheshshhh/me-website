import type { Profile } from "./profile";

export type RecruiterProfile = Omit<Profile, "phone">;

export function toRecruiterProfile(profile: Profile): RecruiterProfile {
  const { phone: _privatePhone, ...recruiterProfile } = profile;
  return recruiterProfile;
}

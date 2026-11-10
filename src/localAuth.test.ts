import { describe, expect, it } from "vitest";
import { isValidLocalCredentials } from "./localAuth";

describe("isValidLocalCredentials", () => {
  it("accepts the configured username and password", () => {
    expect(isValidLocalCredentials("MaheshTest", "Test@123", "MaheshTest", "Test@123")).toBe(true);
  });

  it("rejects incorrect credentials", () => {
    expect(isValidLocalCredentials("MaheshTest", "incorrect", "MaheshTest", "Test@123")).toBe(false);
    expect(isValidLocalCredentials("incorrect", "Test@123", "MaheshTest", "Test@123")).toBe(false);
  });

  it("rejects empty configured credentials", () => {
    expect(isValidLocalCredentials("", "", "", "")).toBe(false);
  });
});

import { describe, it, expect } from "vitest";

import {
  MAX_USERNAME_LENGTH,
  isHexColor,
  sanitizeUsername,
  sanitizeCharacterUpdate,
} from "./characterValidation";

describe("isHexColor", () => {
  it("accepts a 6-digit hex colour", () => {
    expect(isHexColor("#00a8a8")).toBe(true);
    expect(isHexColor("#FFFFFF")).toBe(true);
  });

  it("rejects shorthand, missing hash, and non-strings", () => {
    expect(isHexColor("#fff")).toBe(false);
    expect(isHexColor("00a8a8")).toBe(false);
    expect(isHexColor("red")).toBe(false);
    expect(isHexColor(123)).toBe(false);
    expect(isHexColor(undefined)).toBe(false);
  });
});

describe("sanitizeUsername", () => {
  it("trims surrounding whitespace", () => {
    expect(sanitizeUsername("  steve  ")).toBe("steve");
  });

  it("caps at the maximum length", () => {
    const long = "a".repeat(MAX_USERNAME_LENGTH + 5);
    expect(sanitizeUsername(long)).toHaveLength(MAX_USERNAME_LENGTH);
  });

  it("returns an empty string for non-strings", () => {
    expect(sanitizeUsername(null)).toBe("");
    expect(sanitizeUsername(42)).toBe("");
  });
});

describe("sanitizeCharacterUpdate", () => {
  it("keeps valid colours and a sanitised username", () => {
    expect(
      sanitizeCharacterUpdate({ username: " bob ", headColor: "#123456" })
    ).toEqual({ username: "bob", headColor: "#123456" });
  });

  it("drops invalid colour fields, leaving good ones intact", () => {
    expect(
      sanitizeCharacterUpdate({ headColor: "nope", bodyColor: "#abcdef" })
    ).toEqual({ bodyColor: "#abcdef" });
  });

  it("omits fields that are not present in the partial", () => {
    expect(sanitizeCharacterUpdate({ legColor: "#000000" })).toEqual({
      legColor: "#000000",
    });
  });

  it("tolerates a null or empty partial", () => {
    expect(sanitizeCharacterUpdate(null)).toEqual({});
    expect(sanitizeCharacterUpdate({})).toEqual({});
  });
});

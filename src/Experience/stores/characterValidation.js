// Pure validation for character appearance. Usernames and colours can reach the
// store from user input and (later) the network, so updates are sanitised here
// before they are persisted or rendered: names are trimmed and length-capped,
// and colours must be 6-digit hex. Kept free of zustand so it is unit-testable.

// Longest username kept; matches the customizer input's maxLength so the cap is
// consistent between the field and any other caller.
export const MAX_USERNAME_LENGTH = 16;

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export const isHexColor = (value) =>
  typeof value === "string" && HEX_COLOR.test(value);

export const sanitizeUsername = (value, max = MAX_USERNAME_LENGTH) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/**
 * Filter a partial character update to the fields that are safe to apply: a
 * sanitised username (when present) and any colour field that is valid hex.
 * Invalid fields are dropped so a bad value never overwrites a good one.
 */
export const sanitizeCharacterUpdate = (partial) => {
  const next = {};
  if (partial && "username" in partial) {
    next.username = sanitizeUsername(partial.username);
  }
  for (const key of ["headColor", "bodyColor", "legColor"]) {
    if (partial && key in partial && isHexColor(partial[key])) {
      next[key] = partial[key];
    }
  }
  return next;
};

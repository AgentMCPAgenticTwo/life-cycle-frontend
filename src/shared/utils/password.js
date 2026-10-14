const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const SPECIAL = '!@#$%^&*-_';
const ALL = UPPER + LOWER + DIGITS + SPECIAL;

function pick(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Generates a password that always satisfies {@link isPasswordStrongEnough}. */
export function generateStrongPassword(length = 12) {
  const required = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SPECIAL)];
  const rest = Array.from({ length: Math.max(length - required.length, 0) }, () => pick(ALL));
  return [...required, ...rest].sort(() => Math.random() - 0.5).join('');
}

/**
 * Mirrors the backend's password rule (min 8 chars, upper, lower, number,
 * special char) so the form can show a client-side hint before submitting —
 * the backend's 400 response remains the source of truth on failure.
 */
export function isPasswordStrongEnough(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export const PASSWORD_RULE_MESSAGE =
  'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.';

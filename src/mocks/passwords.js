/**
 * Password strength rules — one place, because the contracts set two.
 *
 *   learners      8–128, letters + digits            (02-learner.md §1, §4)
 *   administrators 12–128, letters + digits + symbol (03 §1, 04 §2, 04 §4)
 *
 * This matters at `POST /me/change-password`, which 04 §4 describes as a
 * "shared self endpoint" — the SAME route serves learners and super-admins but
 * must apply the stricter rule to the latter. Deriving the rule from the
 * caller's actor type keeps that from being an easy thing to forget.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

const hasLetter = (value) => /[A-Za-z]/.test(value);
const hasDigit = (value) => /\d/.test(value);
const hasSymbol = (value) => /[^A-Za-z0-9]/.test(value);

export const LEARNER_RULE =
  "8-128 characters, with at least one letter and one digit";

export const ADMIN_RULE =
  "12-128 characters, with at least one letter, one digit and one symbol";

/** @returns {string|null} the rule text when it fails, else null */
export function learnerPasswordIssue(password) {
  if (typeof password !== "string") return LEARNER_RULE;
  if (password.length < 8 || password.length > 128) return LEARNER_RULE;
  if (!hasLetter(password) || !hasDigit(password)) return LEARNER_RULE;
  return null;
}

/** @returns {string|null} the rule text when it fails, else null */
export function adminPasswordIssue(password) {
  if (typeof password !== "string") return ADMIN_RULE;
  if (password.length < 12 || password.length > 128) return ADMIN_RULE;
  if (!hasLetter(password) || !hasDigit(password) || !hasSymbol(password)) {
    return ADMIN_RULE;
  }
  return null;
}

/** Pick the rule that applies to an account, by actor type. */
export function passwordIssueFor(accountType, password) {
  return accountType === "learner"
    ? learnerPasswordIssue(password)
    : adminPasswordIssue(password);
}

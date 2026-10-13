/**
 * Field-level messages from an API validation error, keyed by field name:
 * `{ name: "Must be at least 3 characters" }`. The contract's `details` is
 * `[{ field, issue }]` (conventions §4).
 */
export const fieldIssues = (error) =>
  Object.fromEntries((error?.details ?? []).map((detail) => [detail.field, detail.issue]));

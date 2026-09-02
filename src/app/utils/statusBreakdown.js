/**
 * `13-analytics.md` §1 breaks a total into named statuses but never promises
 * they cover it — `batches` reports total/active/archived, so a draft batch is
 * inside the total and outside both counts. A card built by naively joining the
 * named counts read "3 · 1 active · 1 archived", which looks like the numbers
 * are wrong rather than incomplete.
 *
 * Anything unaccounted for gets a label instead of being dropped. Zero counts
 * are omitted rather than rendered as "0 archived", which reads as noise.
 *
 * @param {number} total       the headline figure
 * @param {Array<[number, string]>} parts  [count, label] per named status
 * @param {string} otherLabel  what to call whatever the named statuses missed
 */
export const breakdown = (total, parts, otherLabel) => {
  const segments = parts
    .filter(([count]) => count > 0)
    .map(([count, label]) => `${count} ${label}`);

  const other = total - parts.reduce((sum, [count]) => sum + count, 0);
  if (other > 0) segments.push(`${other} ${otherLabel}`);

  return segments.join(" · ") || "none yet";
};

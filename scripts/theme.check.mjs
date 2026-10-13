/**
 * WCAG contrast check for src/styles/theme.css.
 *
 *   node scripts/theme.check.mjs src/styles/theme.css
 *
 * Reads the `:root` (light) and `.dark` blocks, resolves `var(--x)` aliases,
 * and checks every text/background pair the theme promises against AA (4.5:1
 * for text, 3:1 for focus rings and input edges). Exits non-zero on a failure,
 * so it can gate a retune. Also checks that the FALLBACK mirror in
 * src/app/features/useThemeTokens.js still matches the light theme.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = process.argv[2] ?? resolve(root, "src/styles/theme.css");
const css = readFileSync(cssPath, "utf8");

const block = (selector) => {
  const match = css.match(new RegExp(`(^|\\n)${selector}\\s*\\{([\\s\\S]*?)\\n\\}`));
  if (!match) throw new Error(`No ${selector} block in ${cssPath}`);
  const tokens = {};
  for (const [, name, value] of match[2].matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    tokens[name] = value.trim().toLowerCase();
  }
  return tokens;
};

const resolveToken = (tokens, name) => {
  let value = tokens[name];
  while (value?.startsWith("var(")) value = tokens[value.slice(6, -1)];
  if (!value || !/^#[0-9a-f]{6}$/.test(value)) {
    throw new Error(`--${name} does not resolve to a 6-digit hex (got ${value})`);
  }
  return value;
};

const luminance = (hex) =>
  [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const INK = ["text-primary", "text-muted", "accent", "success", "warning", "danger"];
const GROUND = [
  "bg",
  "surface",
  "surface-muted",
  "surface-hover",
  "surface-elevated",
  "surface-elevated-hover",
];
const TINTS = ["tint-lavender", "tint-mint", "tint-slate"];

const PAIRS = [
  ...INK.flatMap((fg) => GROUND.map((bg) => [fg, bg, 4.5])),
  ...["text-primary", "text-muted", "accent"].flatMap((fg) => TINTS.map((bg) => [fg, bg, 4.5])),
  ["success", "success-muted", 4.5],
  ["warning", "warning-muted", 4.5],
  ["danger", "danger-muted", 4.5],
  ["accent", "accent-muted", 4.5],
  ["accent", "accent-muted-hover", 4.5],
  ["accent-contrast", "accent", 4.5],
  ["accent-contrast", "accent-hover", 4.5],
  ["accent-solid-contrast", "accent-solid", 4.5],
  ["accent-solid-contrast", "accent-solid-hover", 4.5],
  ["brand-contrast", "brand", 4.5],
  ["ring", "bg", 3],
  ["ring", "surface-elevated", 3],
  ["border-strong", "bg", 3],
  ["border-strong", "surface-elevated", 3],
  ["border-strong", "field", 3],
];

let failures = 0;
const verbose = process.argv.includes("--verbose");

for (const [theme, selector] of [
  ["light", ":root"],
  ["dark", "\\.dark"],
]) {
  const tokens = block(selector);
  let tightest = null;
  for (const [fg, bg, min] of PAIRS) {
    const r = ratio(resolveToken(tokens, fg), resolveToken(tokens, bg));
    if (r < min) {
      failures++;
      console.log(`FAIL ${theme.padEnd(5)} ${fg} on ${bg}: ${r.toFixed(2)} (needs ${min})`);
    } else if (verbose) {
      console.log(`ok   ${theme.padEnd(5)} ${fg} on ${bg}: ${r.toFixed(2)}`);
    }
    // the pair with the least headroom over its own threshold
    if (!tightest || r / min < tightest.r / tightest.min) tightest = { r, min, fg, bg };
  }
  console.log(
    `${theme}: ${PAIRS.length} pairs checked; tightest is ${tightest.fg} on ${tightest.bg} at ${tightest.r.toFixed(2)}:1`,
  );
}

// the chart FALLBACK mirror must match the light theme
const hookSource = readFileSync(resolve(root, "src/app/features/useThemeTokens.js"), "utf8");
const fallback = hookSource.match(/const FALLBACK = \{([\s\S]*?)\};/);
if (fallback) {
  const light = block(":root");
  for (const [, name, value] of fallback[1].matchAll(/"?([\w-]+)"?:\s*"([^"]+)"/g)) {
    let expected;
    try {
      expected = resolveToken(light, name);
    } catch {
      expected = light[name];
    }
    if (expected?.toLowerCase() !== value.toLowerCase()) {
      failures++;
      console.log(`FAIL FALLBACK["${name}"] is ${value}, theme.css has ${expected}`);
    }
  }
}

process.exit(failures ? 1 : 0);

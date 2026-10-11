/**
 * Extract the 27 chart definitions from the reference build.
 *
 *     node scripts/extract_charts.mjs
 *
 * Writes src/content/generated/charts.json
 *
 * The reference declares every chart as
 *     mkChart(id, type, {hi:[labels], en:[labels]}, [{label:{hi,en}, data:[]}], opts)
 * which is already the shape a React chart component wants. Rather than
 * re-typing 27 of those (and the ~400 numbers in them), this pulls each call
 * expression out of the inline <script> by brace-matching and evaluates it
 * against a recording stub. The data is therefore exact, not transcribed.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const SRC = 'src/pages/site/index.html';
const OUT = 'src/content/generated/charts.json';

const html = fs.readFileSync(SRC, 'utf8');
const rawJs = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .join('\n');

/**
 * Strip comments, string-aware.
 *
 * Needed because the source documents the signature in a comment —
 * `// mkChart(id, type, labels {hi:[…]}, …)` — which the call scanner below
 * would otherwise pick up as the first chart and fail to parse. A plain regex
 * strip would corrupt any `//` inside a string literal, so this walks it.
 */
function stripComments(src) {
  let out = '';
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];
    if (quote) {
      out += ch;
      if (ch === '\\') {
        out += next ?? '';
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i++;
    } else if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      out += ch;
      i++;
    } else if (ch === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i++;
    } else if (ch === '/' && next === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
    } else {
      out += ch;
      i++;
    }
  }
  return out;
}

const js = stripComments(rawJs);

/** Brace-match a complete expression starting at `at`, string-aware. */
function matchFrom(source, at) {
  let i = at;
  let depth = 0;
  let quote = null;
  let started = false;
  while (i < source.length) {
    const ch = source[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
    } else if (ch === '(' || ch === '[' || ch === '{') {
      depth++;
      started = true;
    } else if (ch === ')' || ch === ']' || ch === '}') {
      depth--;
      if (started && depth === 0) return source.slice(at, i + 1);
    }
    i++;
  }
  return source.slice(at);
}

/**
 * Whole IIFEs, not individual calls: the chart blocks declare local helpers
 * (`var noLegend = {...}`) that the calls below them reference, so a call
 * lifted out on its own has unresolved identifiers.
 */
function chartBlocks(source) {
  const out = [];
  for (const m of source.matchAll(/\(function\s*\(/g)) {
    const block = matchFrom(source, m.index);
    if (block.includes('mkChart(')) out.push(block);
  }
  return out;
}

const blocks = chartBlocks(js);
if (!blocks.length) {
  console.error('no mkChart() calls found — has the reference changed?');
  process.exit(1);
}

const charts = {};
const order = [];

const sandbox = {
  mkChart(id, type, labels, datasets, opts) {
    charts[id] = { id, type, labels, datasets: datasets || [], opts: opts || {} };
    order.push(id);
  },
  // The blocks only read these; nothing here needs to behave like a browser.
  Chart: { defaults: { locale: null, font: {} } },
  console,
};
sandbox.window = sandbox;
sandbox.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  documentElement: { style: {}, getAttribute: () => 'hi', setAttribute: () => {} },
};

const ctx = vm.createContext(sandbox);
for (const block of blocks) {
  // The blocks are data declarations plus mkChart calls. Running them is how
  // the client's ~400 numbers are read exactly rather than retyped.
  vm.runInContext(`${block}();`, ctx, { timeout: 5000 });
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ order, charts }, null, 1), 'utf8');

const series = Object.values(charts).reduce((n, c) => n + c.datasets.length, 0);
const points = Object.values(charts).reduce(
  (n, c) => n + c.datasets.reduce((m, d) => m + (d.data?.length || 0), 0),
  0,
);
console.log(`${order.length} charts, ${series} series, ${points} data points -> ${OUT}`);
for (const id of order) {
  const c = charts[id];
  console.log(
    `  ${id.padEnd(6)} ${String(c.type).padEnd(12)} ` +
      `labels=${String(c.labels?.hi?.length ?? 0).padEnd(3)} series=${c.datasets.length}`,
  );
}

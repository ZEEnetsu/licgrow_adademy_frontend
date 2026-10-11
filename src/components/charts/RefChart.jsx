import { useEffect, useMemo, useRef } from 'react';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  DoughnutController,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  LogarithmicScale,
  PieController,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

import { useThemeTokens } from '../../app/features/useThemeTokens.js';
import { useLang } from '../../i18n/index.js';
import data from '../../content/generated/charts.json';

ChartJS.register(
  BarController,
  LineController,
  PieController,
  DoughnutController,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  Filler,
  Tooltip,
  Legend,
);

// Indian digit grouping in ticks and tooltips (12,34,567 rather than 1,234,567),
// matching the reference. Set once at module load, as the reference does.
ChartJS.defaults.locale = 'en-IN';

const TOKENS = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-6',
  'chart-grid', 'chart-tick'];
const ROUND = /^(pie|doughnut|polarArea)$/;

/**
 * One of the 27 charts ported from the reference build.
 *
 * Config comes from src/content/generated/charts.json, extracted by
 * scripts/extract_charts.mjs — the numbers are the client's, read rather than
 * retyped. Labels and series names are `{hi, en}` pairs and re-resolve when the
 * language changes.
 *
 * Colours come from the theme tokens via useThemeTokens, because a canvas
 * cannot read `var(--chart-1)`. The reference only ever used a two-colour
 * palette and fell back to Chart.js's own defaults past two series, which would
 * drop unrelated colours into this palette — here the full chart-1..6 ramp is
 * used instead so a four-series chart still looks like the rest of the site.
 */
/**
 * A few charts carry bilingual axis or plot titles inside `opts` as `{hi, en}`
 * pairs. Chart.js would hand those objects straight to fillText, so resolve
 * every pair in the options tree to the active language first.
 */
function localise(value, t) {
  if (Array.isArray(value)) return value.map((v) => localise(v, t));
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 2 && 'hi' in value && 'en' in value) return t(value);
    return Object.fromEntries(keys.map((k) => [k, localise(value[k], t)]));
  }
  return value;
}

export default function RefChart({ id, ariaLabel, fallbackId, height = 320 }) {
  const { lang, t } = useLang();
  const tokens = useThemeTokens(TOKENS);
  const ref = useRef(null);
  const config = data.charts[id];

  const ramp = useMemo(
    () => [
      tokens['chart-1'], tokens['chart-2'], tokens['chart-3'],
      tokens['chart-4'], tokens['chart-5'], tokens['chart-6'],
    ].filter(Boolean),
    [tokens],
  );

  const chartData = useMemo(() => {
    if (!config) return null;
    const round = ROUND.test(config.type);
    return {
      labels: (config.labels?.[lang] ?? config.labels?.hi ?? []).map((l) => t(l)),
      datasets: config.datasets.map((ds, i) => {
        const colour = ramp[i % ramp.length];
        return {
          ...ds,
          label: t(ds.label),
          // A round chart colours by slice; everything else colours by series.
          backgroundColor: ds.backgroundColor
            ?? (round ? ds.data.map((_, j) => ramp[j % ramp.length]) : colour),
          borderColor: ds.borderColor ?? (round ? '#fff' : colour),
          borderWidth: round ? 2 : ds.borderWidth,
        };
      }),
    };
  }, [config, lang, t, ramp]);

  const options = useMemo(() => {
    if (!config) return {};
    const round = ROUND.test(config.type);
    const opts = localise(config.opts, t);
    const axis = {
      ticks: { color: tokens['chart-tick'] },
      grid: { color: tokens['chart-grid'] },
    };
    return {
      responsive: true,
      maintainAspectRatio: false,
      ...opts,
      plugins: {
        legend: {
          display: config.datasets.length > 1 || round,
          labels: { color: tokens['chart-tick'], usePointStyle: true, boxWidth: 8 },
        },
        ...opts.plugins,
      },
      scales: round
        ? undefined
        : {
            x: { ...axis, ...opts.scales?.x },
            y: { ...axis, ...opts.scales?.y },
          },
    };
  }, [config, tokens, t]);

  /*
   * A chart inside a closed <details> lays out at zero width, and Chart.js
   * sizes to that. The reference solved this by deferring creation until the
   * 'toggle' event; here the chart already exists, so it just needs a resize
   * once the disclosure opens. `toggle` does not bubble — hence the capture
   * listener, same as the reference.
   */
  useEffect(() => {
    const onToggle = (e) => {
      if (!e.target.open) return;
      const canvas = ref.current?.canvas;
      if (canvas && e.target.contains(canvas)) ref.current.resize();
    };
    document.addEventListener('toggle', onToggle, true);
    return () => document.removeEventListener('toggle', onToggle, true);
  }, []);

  if (!config) {
    return null; // a figure whose canvas has no definition: the table below it stands in
  }

  return (
    <div
      className="relative my-4 rounded-card border border-black/6 bg-white p-3"
      style={{ height }}
    >
      <Chart
        ref={ref}
        type={config.type}
        data={chartData}
        options={options}
        aria-label={ariaLabel}
        role="img"
        {...(fallbackId ? { 'aria-describedby': fallbackId } : {})}
      />
    </div>
  );
}

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import { useThemeTokens } from '../app/features/useThemeTokens.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title
);

/**
 * Token names this chart needs resolved. A canvas cannot inherit CSS, so every
 * colour has to be handed to Chart.js as a string — see useThemeTokens.
 */
const TOKENS = [
  'chart-1',
  'chart-grid',
  'chart-tick',
  'surface-elevated',
  'text-primary',
  'border',
];

/**
 * The area fill is the line colour faded out. Chart.js needs a concrete colour
 * string for a gradient stop, so the token's hex is converted rather than
 * handed over as a `color-mix()` the canvas cannot parse. A non-hex token is
 * returned untouched and simply renders opaque.
 */
const withAlpha = (colour, alpha) => {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(colour ?? '');
  if (!match) return colour;
  const h = match[1];
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function AreaChart({ xAxisLabel = '', yAxisLabel = '', coordinates = [{}], height = 250 }) {
  const theme = useThemeTokens(TOKENS);

  const labels = [];
  const dataPoints = [];

  coordinates.forEach((pt, idx) => {
    if (Array.isArray(pt)) {
      labels.push(String(pt[0]));
      dataPoints.push(Number(pt[1]));
    } else if (pt && typeof pt === 'object' && ('x' in pt || 'y' in pt)) {
      labels.push(String(pt.x));
      dataPoints.push(Number(pt.y));
    } else if (typeof pt === 'number') {
      labels.push(String(idx + 1));
      dataPoints.push(pt);
    }
  });

  const line = theme['chart-1'];

  const data = {
    labels,
    datasets: [
      {
        label: yAxisLabel || undefined,
        data: dataPoints,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        borderColor: line,
        pointBackgroundColor: line,
        pointHoverBorderColor: line,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return withAlpha(line, 0.18);
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, withAlpha(line, 0.4));
          gradient.addColorStop(1, withAlpha(line, 0.02));
          return gradient;
        },
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        // Chart.js defaults to a near-black box — a dark card on a light page
        backgroundColor: theme['surface-elevated'],
        titleColor: theme['text-primary'],
        bodyColor: theme['text-primary'],
        borderColor: theme['border'],
        borderWidth: 1,
      },
      title: { display: false },
    },
    scales: {
      x: {
        title: { display: !!xAxisLabel, text: xAxisLabel, color: theme['chart-tick'] },
        // axis text was left to Chart.js's default grey, which is legible
        // against neither a white page nor a near-black one
        ticks: { color: theme['chart-tick'] },
        border: { color: theme['chart-grid'] },
        grid: { display: false },
      },
      y: {
        title: { display: !!yAxisLabel, text: yAxisLabel, color: theme['chart-tick'] },
        ticks: { color: theme['chart-tick'] },
        border: { color: theme['chart-grid'] },
        grid: { color: theme['chart-grid'] },
      },
    },
  };

  /*
   * No card of its own — the caller decides the chrome, the same way PieChart
   * works. Carrying a surface here meant a card inside a card wherever the
   * chart was placed in a panel.
   */
  return (
    <div style={{ height }} className="text-text-primary">
      <Line data={data} options={options} />
    </div>
  );
}

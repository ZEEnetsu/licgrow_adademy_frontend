import { useEffect, useRef } from "react";
import * as Chart from "chart.js";

import { useThemeTokens } from "../app/features/useThemeTokens.js";

/*
 * Chart.js ships tree-shakeable, so every piece has to be registered by hand —
 * including the CONTROLLER, not just the element it draws.
 *
 * Registering ArcElement alone renders nothing and throws "pie is not a
 * registered controller" at construction. Both controllers are registered
 * because this component supports `type="pie"` and `type="doughnut"`.
 */
Chart.Chart.register(
  Chart.PieController,
  Chart.DoughnutController,
  Chart.ArcElement,
  Chart.Tooltip,
  Chart.Legend,
);

/**
 * Every colour a pie needs, as token names. Resolved at runtime because a
 * canvas cannot inherit CSS — see useThemeTokens.
 */
const TOKENS = [
  "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6",
  "chart-tick", "surface-elevated", "text-primary", "border", "surface",
];

const PieChart = ({
  data = [], // [{ label: "Math", value: 40 }, ...]
  type = "pie", // "pie" | "doughnut"
  title = "",
  showLegend = false,
  height = 200,
}) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const theme = useThemeTokens(TOKENS);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    // destroy previous instance before re-creating
    if (chartRef.current) chartRef.current.destroy();

    const series = [1, 2, 3, 4, 5, 6].map((n) => theme[`chart-${n}`]);

    chartRef.current = new Chart.Chart(canvasRef.current, {
      type,
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            backgroundColor: data.map((_, i) => series[i % series.length]),
            // the slice outline is the surface behind it, so slices read as
            // separated rather than as one blob with seams
            borderColor: theme["surface"],
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: showLegend,
            position: "bottom",
            labels: {
              color: theme["chart-tick"],
              padding: 16,
              font: { size: 12 },
              usePointStyle: true,
              pointStyleWidth: 18,
            },
          },
          tooltip: {
            // Chart.js defaults to a near-black box, which is a dark card
            // sitting on a light page
            backgroundColor: theme["surface-elevated"],
            titleColor: theme["text-primary"],
            bodyColor: theme["text-primary"],
            borderColor: theme["border"],
            borderWidth: 1,
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                return `  ${ctx.label}: ${ctx.parsed} (${pct}%)`;
              },
            },
          },
        },
        ...(type === "doughnut" && {
          cutout: "65%",
        }),
      },
    });

    return () => chartRef.current?.destroy();
  }, [data, type, showLegend, theme]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-40 text-text-muted text-sm">
        No data available
      </div>
    );
  }

  /*
   * No card, no border, no padding of its own. The chart used to carry its own
   * elevated surface, so dropping it into a Panel produced a card inside a
   * card. Chrome belongs to whatever is placing the chart.
   */
  return (
    <div>
      {title && (
        <p className="text-text-primary font-semibold text-sm mb-3">{title}</p>
      )}
      <div style={{ height }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default PieChart;

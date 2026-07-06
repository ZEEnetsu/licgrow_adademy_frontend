import { useEffect, useRef } from "react";
import * as Chart from "chart.js";

Chart.Chart.register(Chart.ArcElement, Chart.Tooltip, Chart.Legend);

// variant color palettes
const VARIANTS = {
  default: ["#4ADE80", "#3AB367", "#29884D", "#227642", "#14532D", "#185C33"],
  cool: ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#6366f1", "#0ea5e9"],
  warm: ["#f59e0b", "#ef4444", "#f97316", "#eab308", "#dc2626", "#fb923c"],
  mono: ["#e4e4e7", "#a1a1aa", "#71717a", "#52525b", "#3f3f46", "#27272a"],
};

const PieChart = ({
  data = [], // [{ label: "Math", value: 40 }, ...]
  variant = "default", // "default" | "cool" | "warm" | "mono"
  type = "pie", // "pie" | "doughnut"
  title = "",
  showLegend = false,
  height = 200,
}) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    // destroy previous instance before re-creating
    if (chartRef.current) chartRef.current.destroy();

    const colors = VARIANTS[variant] ?? VARIANTS.default;

    chartRef.current = new Chart.Chart(canvasRef.current, {
      type,
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            backgroundColor: data.map(
              (_, i) => colors[i % colors.length] + "cc",
            ), // cc = 80% opacity
            borderColor: data.map((_, i) => colors[i % colors.length]),
            borderWidth: 1.5,
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
              color: "#a1a1aa",
              padding: 16,
              font: { size: 12 },
              usePointStyle: true,
              pointStyleWidth: 18,
            },
          },
          tooltip: {
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
  }, [data, variant, type, showLegend]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-500 text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated border border-surface-elevated rounded-xl p-4">
      {title && (
        <p className="text-primary font-semibold text-sm mb-3">{title}</p>
      )}
      <div style={{ height }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default PieChart;

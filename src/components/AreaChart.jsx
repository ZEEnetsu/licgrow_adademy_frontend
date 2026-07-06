import React from 'react';
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

export default function AreaChart({ xAxisLabel = '', yAxisLabel = '', coordinates = [{}], height = 250 }) {
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

  const data = {
    labels,
    datasets: [
      {
        label: yAxisLabel || undefined,
        data: dataPoints,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        borderColor: '#2EBF8A',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(46,191,138,0.18)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(46,191,138,0.45)');
          gradient.addColorStop(1, 'rgba(86,207,225,0.06)');
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
      legend: { display: false},
      tooltip: { mode: 'index', intersect: false },
      title: { display: false },
    },
    scales: {
      x: {
        title: { display: !!xAxisLabel, text: xAxisLabel, },
        // ticks: { color: '#d4d4d8' },
        grid: { display: false },
      },
      y: {
        title: { display: !!yAxisLabel, text: yAxisLabel, },
        // ticks: { color: '#d4d4d8' },
        // grid: { color: 'rgba(74,74,104,0.08)' },
      },
    },
  };

  return (
    <div className="bg-surface-elevated rounded-md p-4">
      <div style={{ height }} className='text-text-primary'>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

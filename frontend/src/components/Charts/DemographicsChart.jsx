import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DemographicsChart = ({ type, data, title }) => {
  if (!data || Object.keys(data).length === 0) return <div className="text-muted small">No data yet</div>;

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'Registrations',
        data: Object.values(data),
        backgroundColor: [
          'rgba(124, 58, 237, 0.6)', // Purple
          'rgba(59, 130, 246, 0.6)', // Blue
          'rgba(16, 185, 129, 0.6)', // Green
          'rgba(239, 68, 68, 0.6)',  // Red
          'rgba(245, 158, 11, 0.6)', // Yellow
        ],
        borderColor: [
          'rgba(124, 58, 237, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'right', labels: { color: '#fff' } },
      title: { display: true, text: title, color: '#fff' }
    },
    scales: type === 'bar' ? {
      y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { ticks: { color: '#fff' }, grid: { display: false } }
    } : {}
  };

  return (
    <div className="p-3 glass-card h-100">
      {type === 'doughnut' ? <Doughnut data={chartData} options={options} /> : <Bar data={chartData} options={options} />}
    </div>
  );
};

export default DemographicsChart;
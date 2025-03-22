// frontend/src/components/Charts.js
import React from 'react';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Warm color palette for charts
const warmColors = [
  '#FFA500', // Orange
  '#FF8C00', // Dark Orange
  '#FF7F50', // Coral
  '#FF6347', // Tomato
  '#F4A460', // Sandy Brown
  '#E9967A', // Dark Salmon
  '#CD853F', // Peru
  '#D2691E', // Chocolate
  '#B8860B', // Dark Goldenrod
  '#DAA520', // Goldenrod
  '#FFD700', // Gold
];

/**
 * Expense Distribution Pie Chart
 */
export const ExpensePieChart = ({ categoryTotals }) => {
  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: warmColors,
        borderColor: 'white',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: $${value.toFixed(2)}`;
          }
        }
      }
    }
  };

  return <Pie data={data} options={options} />;
};

/**
 * Income vs Spending Bar Chart
 */
export const IncomeVsSpendingChart = ({ income, spending }) => {
  const data = {
    labels: ['Income', 'Spending'],
    datasets: [
      {
        label: 'Amount ($)',
        data: [income, spending],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',  // Teal for income
          'rgba(255, 99, 132, 0.6)',  // Pink for spending
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: $${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };

  return <Bar data={data} options={options} />;
};

/**
 * Category Spending Bar Chart (Horizontal)
 */
export const CategorySpendingBarChart = ({ categories, amounts }) => {
  const data = {
    labels: categories,
    datasets: [
      {
        label: 'Spending ($)',
        data: amounts,
        backgroundColor: 'rgba(255, 165, 0, 0.6)',  // Orange with transparency
        borderColor: 'rgb(255, 165, 0)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y',  // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.x || 0;
            return `${label}: $${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };

  return <Bar data={data} options={options} />;
};

/**
 * Budget Progress Doughnut Chart
 */
export const BudgetProgressChart = ({ spent, remaining }) => {
  // Make sure we don't have negative remaining
  const safeRemaining = Math.max(0, remaining);
  
  const data = {
    labels: ['Spent', 'Remaining'],
    datasets: [
      {
        data: [spent, safeRemaining],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',  // Pink for spent
          'rgba(75, 192, 192, 0.6)',  // Teal for remaining
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(75, 192, 192)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: $${value.toFixed(2)}`;
          }
        }
      }
    }
  };

  return <Doughnut data={data} options={options} />;
};

export default {
  ExpensePieChart,
  IncomeVsSpendingChart,
  CategorySpendingBarChart,
  BudgetProgressChart
};
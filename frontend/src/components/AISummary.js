// frontend/src/components/AISummary.js
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { generateSummary } from '../api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AISummary = ({ initialMonth, initialYear, availablePeriods }) => {
  const [month, setMonth] = useState(initialMonth || (new Date().getMonth() + 1));
  const [year, setYear] = useState(initialYear || new Date().getFullYear());
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get years for selector (from available periods or default)
  const getYearsToShow = () => {
    if (availablePeriods) {
      return availablePeriods.years;
    } else {
      const years = [];
      const currentYear = new Date().getFullYear();
      for (let i = currentYear - 2; i <= currentYear; i++) {
        years.push(i);
      }
      return years;
    }
  };

  // Get months for selector based on selected year
  const getMonthsToShow = () => {
    if (availablePeriods && availablePeriods.months[year]) {
      return availablePeriods.months[year];
    } else {
      // Default to all months
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }
  };

  // Effect to handle initialMonth/initialYear updates
  useEffect(() => {
    if (initialMonth && initialMonth !== month) {
      setMonth(initialMonth);
    }
    if (initialYear && initialYear !== year) {
      setYear(initialYear);
    }
  }, [initialMonth, initialYear]);

  // Effect to validate month/year when availablePeriods changes
  useEffect(() => {
    if (availablePeriods) {
      const isValidYear = availablePeriods.years.includes(year);
      const isValidMonth = isValidYear &&
        availablePeriods.months[year] &&
        availablePeriods.months[year].includes(month);

      if (!isValidYear || !isValidMonth) {
        // Find a valid month/year combination
        const validYear = availablePeriods.years[availablePeriods.years.length - 1]; // default to latest year
        const validMonth = availablePeriods.months[validYear][availablePeriods.months[validYear].length - 1]; // default to latest month

        setMonth(validMonth);
        setYear(validYear);
      }
    }
  }, [availablePeriods, month, year]);

  const handleGenerateSummary = async () => {
    try {
      setIsLoading(true);
      setError('');

      const data = await generateSummary({
        month,
        year
      });

      setSummaryData(data);
    } catch (error) {
      console.error('Error generating summary:', error);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthChange = (e) => {
    setMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);

    // If we have available periods, we need to select a valid month for the new year
    if (availablePeriods && availablePeriods.months[newYear]) {
      // If current month is available in the new year, keep it
      if (availablePeriods.months[newYear].includes(month)) {
        setYear(newYear);
      } else {
        // Otherwise, select the first available month in that year
        const firstAvailableMonth = availablePeriods.months[newYear][0];
        setMonth(firstAvailableMonth);
        setYear(newYear);
      }
    } else {
      // No available periods info, just change the year
      setYear(newYear);
    }
  };

  // Prepare chart data
  let chartData = null;
  if (summaryData && summaryData.top_categories) {
    const categories = Object.keys(summaryData.top_categories);
    const amounts = Object.values(summaryData.top_categories);

    chartData = {
      labels: categories,
      datasets: [
        {
          label: 'Spending by Category ($)',
          data: amounts,
          backgroundColor: 'rgba(255, 165, 0, 0.6)',
          borderColor: 'rgb(255, 165, 0)',
          borderWidth: 1
        }
      ]
    };
  }

  const yearsToShow = getYearsToShow();
  const monthsToShow = getMonthsToShow();

  return (
    <div>
      <h2>AI Monthly Summary</h2>

      <div className="card">
        <h3>Generate Monthly Analysis</h3>
        <p>
          Select a month and year to generate an AI-powered analysis of your spending habits.
        </p>

        {error && (
          <div style={{ padding: '10px', backgroundColor: '#ffebee', color: '#c62828', marginBottom: '15px', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', marginTop: '20px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="month">Month</label>
            <select
              id="month"
              value={month}
              onChange={handleMonthChange}
              style={{ width: '100%' }}
            >
              {monthsToShow.map((monthIndex) => (
                <option key={monthIndex} value={monthIndex}>
                  {months[monthIndex - 1]}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label htmlFor="year">Year</label>
            <select
              id="year"
              value={year}
              onChange={handleYearChange}
              style={{ width: '100%' }}
            >
              {yearsToShow.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleGenerateSummary}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Summary'}
        </button>
      </div>

      {/* Summary Results section remains unchanged */}
      {summaryData && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>
            Monthly Summary for {months[month - 1]} {year}
          </h3>

          <div style={{
            backgroundColor: summaryData.budget_status === 'Under Budget' ? '#e8f5e9' : '#ffebee',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <h4 style={{
              color: summaryData.budget_status === 'Under Budget' ? '#2e7d32' : '#c62828',
              margin: '0 0 10px 0'
            }}>
              Status: {summaryData.budget_status}
            </h4>
            <p style={{ margin: 0 }}>
              Total Spending: <strong>${summaryData.total_spending.toFixed(2)}</strong>
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>AI Analysis</h4>
            <div style={{
              backgroundColor: 'var(--secondary)',
              padding: '15px',
              borderRadius: '4px',
              fontStyle: 'italic'
            }}>
              <p>{summaryData.summary}</p>
            </div>
          </div>

          {chartData && (
            <div>
              <h4>Spending by Category</h4>
              <div className="chart-container">
                <Bar
                  data={chartData}
                  options={{
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                      x: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AISummary;
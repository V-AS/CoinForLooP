// frontend/src/components/AISummary.js
import React, { useState } from 'react';
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

const AISummary = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 2; i <= currentYear; i++) {
    years.push(i);
  }

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
              onChange={(e) => setMonth(parseInt(e.target.value))}
              style={{ width: '100%' }}
            >
              {months.map((name, index) => (
                <option key={name} value={index + 1}>{name}</option>
              ))}
            </select>
          </div>
          
          <div style={{ flex: 1 }}>
            <label htmlFor="year">Year</label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              style={{ width: '100%' }}
            >
              {years.map(y => (
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
      
      {/* Summary Results */}
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
// frontend/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
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
import ExpenseModal from './ExpenseModal';
import IncomeModal from './IncomeModal';
import { getTransactions, getIncome, getGoals } from '../api';

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

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [goals, setGoals] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transactionsData, incomeData, goalsData] = await Promise.all([
          getTransactions(),
          getIncome(),
          getGoals()
        ]);
        
        setTransactions(transactionsData);
        setIncome(incomeData.income);
        setGoals(goalsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshData = async () => {
    try {
      const [transactionsData, incomeData] = await Promise.all([
        getTransactions(),
        getIncome()
      ]);
      
      setTransactions(transactionsData);
      setIncome(incomeData.income);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Calculate total spending
  const totalSpending = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  // Group transactions by category
  const categoryTotals = transactions.reduce((acc, transaction) => {
    const { category, amount } = transaction;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += amount;
    return acc;
  }, {});

  // Prepare chart data
  const pieChartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#FFA500', // Orange
          '#FF8C00', // Dark Orange
          '#FFD700', // Gold
          '#FF6347', // Tomato
          '#FF7F50', // Coral
          '#F4A460', // Sandy Brown
          '#CD853F', // Peru
          '#D2691E', // Chocolate
        ],
        borderWidth: 1,
      },
    ],
  };

  const barChartData = {
    labels: ['Income', 'Spending'],
    datasets: [
      {
        label: 'Amount ($)',
        data: [income, totalSpending],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
      },
    ],
  };

  return (
    <div>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Dashboard</h2>
        <div>
          <button 
            className="btn btn-primary" 
            style={{ marginRight: '10px' }}
            onClick={() => setIsExpenseModalOpen(true)}
          >
            Record Expense
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setIsIncomeModalOpen(true)}
          >
            Set Income
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading dashboard data...</p>
      ) : (
        <>
          <div className="row">
            <div className="col">
              <div className="card">
                <h3>Income vs. Spending</h3>
                <div className="chart-container">
                  <Bar data={barChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card">
                <h3>Expenses by Category</h3>
                <div className="chart-container">
                  {Object.keys(categoryTotals).length > 0 ? (
                    <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
                  ) : (
                    <p>No expense data to display</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary Card */}
          <div className="card">
            <h3>Financial Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h4>Monthly Income</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)' }}>
                  ${income.toFixed(2)}
                </p>
              </div>
              <div>
                <h4>Total Spending</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--danger)' }}>
                  ${totalSpending.toFixed(2)}
                </p>
              </div>
              <div>
                <h4>Remaining Budget</h4>
                <p style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: income - totalSpending > 0 ? 'var(--success)' : 'var(--danger)' 
                }}>
                  ${(income - totalSpending).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Goals Section */}
          {goals.length > 0 && (
            <div className="card">
              <h3>Your Financial Goals</h3>
              {goals.map(goal => (
                <div key={goal.id} className="summary-card">
                  <h4>{goal.description}</h4>
                  <p>Target: ${goal.target_amount.toFixed(2)} by {new Date(goal.deadline).toLocaleDateString()}</p>
                  {goal.ai_plan && (
                    <div style={{ backgroundColor: 'var(--secondary)', padding: '10px', marginTop: '10px', borderRadius: '4px' }}>
                      <h5>AI Savings Plan:</h5>
                      <p>{goal.ai_plan}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Recent Transactions */}
          <div className="card">
            <h3>Recent Transactions</h3>
            {transactions.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Category</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Description</th>
                    <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map(transaction => (
                    <tr key={transaction.id}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{transaction.category}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{transaction.description}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'right' }}>
                        ${transaction.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No transactions to display</p>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {isExpenseModalOpen && (
        <ExpenseModal 
          onClose={() => setIsExpenseModalOpen(false)} 
          onSave={refreshData}
        />
      )}
      
      {isIncomeModalOpen && (
        <IncomeModal 
          onClose={() => setIsIncomeModalOpen(false)} 
          onSave={refreshData}
          currentIncome={income}
        />
      )}
    </div>
  );
};

export default Dashboard;
// frontend/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import MonthSelector from './MonthSelector';
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

const Dashboard = ({ initialMonth, initialYear, onMonthChange, availablePeriods }) => {
  // Use initial month and year from props, or current date if not provided
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || (new Date().getMonth() + 1)); // 1-12
  const [selectedYear, setSelectedYear] = useState(initialYear || new Date().getFullYear());

  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [goals, setGoals] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(5);

  // Update local state when props change
  useEffect(() => {
    if (initialMonth && initialMonth !== selectedMonth) {
      setSelectedMonth(initialMonth);
    }
    if (initialYear && initialYear !== selectedYear) {
      setSelectedYear(initialYear);
    }
  }, [initialMonth, initialYear]);

  // Validate if the current month/year combination is available
  useEffect(() => {
    if (availablePeriods) {
      const isValidYear = availablePeriods.years.includes(selectedYear);
      const isValidMonth = isValidYear && availablePeriods.months[selectedYear]?.includes(selectedMonth);

      if (!isValidYear || !isValidMonth) {
        // Find a valid month/year combination
        const validYear = availablePeriods.years[availablePeriods.years.length - 1]; // default to latest year
        const validMonth = availablePeriods.months[validYear][availablePeriods.months[validYear].length - 1]; // default to latest month

        // Update both local state and parent state
        setSelectedMonth(validMonth);
        setSelectedYear(validYear);

        if (onMonthChange) {
          onMonthChange({ month: validMonth, year: validYear });
        }
      }
    }
  }, [availablePeriods, selectedMonth, selectedYear, onMonthChange]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transactionsData, incomeData, goalsData] = await Promise.all([
          getTransactions(selectedMonth, selectedYear),
          getIncome(selectedMonth, selectedYear),
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
  }, [selectedMonth, selectedYear]);

  // Filter transactions by selected month and year
  useEffect(() => {
    if (transactions.length > 0) {
      const filtered = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() + 1 === selectedMonth &&
          transactionDate.getFullYear() === selectedYear
        );
      });
      setFilteredTransactions(filtered);
      // Reset to first page when filter changes
      setCurrentPage(1);
    }
  }, [transactions, selectedMonth, selectedYear]);

  const refreshData = async () => {
    try {
      const [transactionsData, incomeData] = await Promise.all([
        getTransactions(selectedMonth, selectedYear),
        getIncome(selectedMonth, selectedYear)
      ]);

      setTransactions(transactionsData);
      setIncome(incomeData.income);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const handleMonthChange = ({ month, year }) => {
    setSelectedMonth(month);
    setSelectedYear(year);

    // Call parent component's handler if provided
    if (onMonthChange) {
      onMonthChange({ month, year });
    }
  };

  // Calculate total spending for the selected month
  const totalSpending = filteredTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  // Group transactions by category for the selected month
  const categoryTotals = filteredTransactions.reduce((acc, transaction) => {
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

  const mostRecentGoal = goals.length > 0
    ? goals.reduce((recentest, goal) => {
      const goalDate = new Date(goal.deadline);
      const recentestDate = new Date(recentest.deadline);
      return goalDate < recentestDate ? goal : recentest;
    }, goals[0])
    : null;

  // Get current transactions for pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  // Calculate total pages
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Format month name
  const getMonthName = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex - 1];
  };

  return (
    <div>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Dashboard</h2>
        {/* current financial goals */}
        {goals.length > 0 && (
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeftColor: 'white', marginBottom: '0', padding: '10px' }}>
            <Link to="/goal-planner#your-financial-goals" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: '500' }}>
              Goal: {mostRecentGoal.description}
            </Link>
          </div>
        )}
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

      {/* Month Selector */}
      <MonthSelector
          currentMonth={selectedMonth}
          currentYear={selectedYear}
          onChange={handleMonthChange}
          availablePeriods={availablePeriods}
        />

      {/* Show selected month info */}
      <div className="card" style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--secondary)' }}>
        <h3 style={{ margin: '0', color: 'var(--primary)' }}>
          Viewing data for {getMonthName(selectedMonth)} {selectedYear}
        </h3>
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
                    <p>No expense data to display for {getMonthName(selectedMonth)} {selectedYear}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary Card */}
          <div className="card">
            <h3>Financial Summary for {getMonthName(selectedMonth)} {selectedYear}</h3>
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

          {/* Recent Transactions with Pagination */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Transactions for {getMonthName(selectedMonth)} {selectedYear}</h3>
              <div>
                {filteredTransactions.length > 0 && (
                  <span style={{ color: 'var(--text-light)' }}>
                    Showing {indexOfFirstTransaction + 1}-{Math.min(indexOfLastTransaction, filteredTransactions.length)} of {filteredTransactions.length}
                  </span>
                )}
              </div>
            </div>

            {filteredTransactions.length > 0 ? (
              <>
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
                    {currentTransactions.map(transaction => (
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="btn btn-secondary"
                      style={{
                        padding: '5px 10px',
                        marginRight: '10px',
                        opacity: currentPage === 1 ? 0.5 : 1
                      }}
                    >
                      &laquo; Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`btn ${currentPage === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                          padding: '5px 10px',
                          margin: '0 5px',
                          minWidth: '30px'
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="btn btn-secondary"
                      style={{
                        padding: '5px 10px',
                        marginLeft: '10px',
                        opacity: currentPage === totalPages ? 0.5 : 1
                      }}
                    >
                      Next &raquo;
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p>No transactions for {getMonthName(selectedMonth)} {selectedYear}</p>
            )}
          </div>
        </>
      )}
      {/* Modals */}
      {isExpenseModalOpen && (
        <ExpenseModal
          onClose={() => setIsExpenseModalOpen(false)}
          onSave={refreshData}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          availablePeriods={availablePeriods}
        />
      )}

      {isIncomeModalOpen && (
        <IncomeModal
          onClose={() => setIsIncomeModalOpen(false)}
          onSave={refreshData}
          currentIncome={income}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          availablePeriods={availablePeriods}
        />
      )}
    </div>
  );
};

export default Dashboard;
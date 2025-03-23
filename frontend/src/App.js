// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import GoalPlanner from './components/GoalPlanner';
import AISummary from './components/AISummary';
import { getAvailablePeriods } from './api';
import './styles/global.css';

function App() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [availablePeriods, setAvailablePeriods] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailablePeriods = async () => {
      try {
        const periods = await getAvailablePeriods();
        setAvailablePeriods(periods);
        
        // Set default month/year to the most recent available
        const latestYear = periods.years[periods.years.length - 1];
        const latestMonth = Math.max(...periods.months[latestYear]);
        
        setSelectedMonth(latestMonth);
        setSelectedYear(latestYear);
      } catch (error) {
        console.error('Error loading available periods:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailablePeriods();
  }, []);

  // Handler for when month selection changes
  const handleMonthChange = ({ month, year }) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  return (
    <Router>
      <div className="app">
        <header className="header">
          <h1>CoinForLoop</h1>
        </header>

        <nav className="nav">
          <NavLink to="/" className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }>
            Dashboard
          </NavLink>
          <NavLink to="/goal-planner" className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }>
            Goal Planner
          </NavLink>
          <NavLink to="/ai-summary" className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }>
            AI Summary
          </NavLink>
        </nav>

        <main className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/goal-planner" element={<GoalPlanner />} />
            <Route path="/ai-summary" element={<AISummary />} />
          </Routes>
        </main>

        <footer style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          <p>CoinForLoop &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
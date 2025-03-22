// frontend/src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import GoalPlanner from './components/GoalPlanner';
import AISummary from './components/AISummary';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <h1>AI-Powered Budget App</h1>
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
          <p>Budget App &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
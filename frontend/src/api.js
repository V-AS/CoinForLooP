// frontend/src/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Transactions
// Transactions
export const getTransactions = async (month, year) => {
  try {
    let url = '/transactions';
    
    // Add month and year parameters if provided
    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

// Income
export const getIncome = async (month, year) => {
  try {
    let url = '/income';
    
    // Always include month and year parameters when getting income
    // This ensures we're getting the income for a specific month
    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching income:', error);
    throw error;
  }
};

export const updateIncome = async (incomeData) => {
  try {
    // Ensure month and year are included in the request
    if (!incomeData.month || !incomeData.year) {
      throw new Error('Month and year are required when updating income');
    }
    
    const response = await api.post('/income', incomeData);
    return response.data;
  } catch (error) {
    console.error('Error updating income:', error);
    throw error;
  }
};

// Goals
export const getGoals = async () => {
  try {
    const response = await api.get('/goals');
    return response.data;
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
};

export const createGoal = async (goalData) => {
  try {
    const response = await api.post('/goal', {
      description: goalData.description,
      target_amount: goalData.target_amount,
      deadline: goalData.deadline,
      goal_priority: goalData.goal_priority || 1 // Ensure we always have a priority
    });
    return response.data;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

export const deleteGoal = async (goalId) => {
  try {
    const response = await api.delete(`/goal/${goalId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

// Summary
export const generateSummary = async (summaryData) => {
  try {
    const response = await api.post('/summary', summaryData);
    return response.data;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
};

export const getAvailablePeriods = async () => {
  try {
    const response = await api.get('/available-periods');
    return response.data;
  } catch (error) {
    console.error('Error fetching available periods:', error);
    throw error;
  }
};

export default api;

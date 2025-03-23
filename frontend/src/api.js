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
export const getTransactions = async () => {
  try {
    const response = await api.get('/transactions');
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
export const getIncome = async () => {
  try {
    const response = await api.get('/income');
    return response.data;
  } catch (error) {
    console.error('Error fetching income:', error);
    throw error;
  }
};

export const updateIncome = async (incomeData) => {
  try {
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
    const response = await api.post('/goal', goalData);
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

export const regenerateAIPlan = async (goalId) => {
  try {
    const response = await api.post(`/goal/${goalId}/regenerate-plan`);
    return response.data;
  } catch (error) {
    console.error('Error regenerating AI plan:', error);
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

export default api;

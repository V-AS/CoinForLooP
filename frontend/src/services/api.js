// src/services/api.js
import axios from 'axios';

// Base URL for API requests
const API_URL = 'http://localhost:5000/api';

// Expenses API
export const expenseAPI = {
  getExpenses: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await axios.get(`${API_URL}/expenses${query}`);
    return response.data;
  },
  
  addExpense: async (expense) => {
    const response = await axios.post(`${API_URL}/expenses`, expense);
    return response.data;
  },
  
  deleteExpense: async (id) => {
    const response = await axios.delete(`${API_URL}/expenses/${id}`);
    return response.data;
  },
  
  getCategories: async () => {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  }
};

// Goals API
export const goalAPI = {
  getGoals: async () => {
    const response = await axios.get(`${API_URL}/goals`);
    return response.data;
  },
  
  getGoal: async (id) => {
    const response = await axios.get(`${API_URL}/goals/${id}`);
    return response.data;
  },
  
  addGoal: async (goal) => {
    const response = await axios.post(`${API_URL}/goals`, goal);
    return response.data;
  },
  
  updateGoal: async (id, goal) => {
    const response = await axios.put(`${API_URL}/goals/${id}`, goal);
    return response.data;
  },
  
  deleteGoal: async (id) => {
    const response = await axios.delete(`${API_URL}/goals/${id}`);
    return response.data;
  },
  
  getGoalPlan: async (id) => {
    const response = await axios.get(`${API_URL}/goals/${id}/plan`);
    return response.data;
  },
  
  generateGoalPlan: async (id) => {
    const response = await axios.post(`${API_URL}/goals/${id}/plan`);
    return response.data;
  }
};

// Dashboard API
export const dashboardAPI = {
  getDashboardData: async () => {
    const response = await axios.get(`${API_URL}/dashboard`);
    return response.data;
  }
};

// Error handler
export const handleApiError = (error) => {
  if (error.response) {
    return {
      status: error.response.status,
      message: error.response.data.error || 'An error occurred'
    };
  } else if (error.request) {
    return {
      status: 0,
      message: 'No response from server. Please check if backend is running.'
    };
  } else {
    return {
      status: 0,
      message: error.message || 'An unknown error occurred'
    };
  }
};
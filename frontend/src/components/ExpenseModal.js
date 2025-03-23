// frontend/src/components/ExpenseModal.js
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createTransaction } from '../api';

const ExpenseModal = ({ onClose, onSave, selectedMonth, selectedYear, availablePeriods }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check if the selected month/year is valid according to availablePeriods
  useEffect(() => {
    if (availablePeriods) {
      const isValidYear = availablePeriods.years.includes(selectedYear);
      const isValidMonth = isValidYear && 
        availablePeriods.months[selectedYear] && 
        availablePeriods.months[selectedYear].includes(selectedMonth);
      
      if (!isValidYear || !isValidMonth) {
        // Show error or redirect
        setError(`Selected month (${selectedMonth}/${selectedYear}) is not available for recording expenses.`);
        return;
      }
    }
  }, [availablePeriods, selectedMonth, selectedYear]);

  // Set default date to the first day of the selected month/year
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      // Month in JavaScript is 0-indexed, but our selectedMonth is 1-indexed
      const newDate = new Date(selectedYear, selectedMonth - 1, 1);
      
      // If new date is in the future, set to current date
      const currentDate = new Date();
      if (newDate > currentDate) {
        setDate(currentDate);
      } else {
        // Keep the day if possible, otherwise set to the first day
        const currentDay = Math.min(currentDate.getDate(), new Date(selectedYear, selectedMonth, 0).getDate());
        newDate.setDate(currentDay);
        setDate(newDate);
      }
    }
  }, [selectedMonth, selectedYear]);

  // Common expense categories
  const categories = [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Personal Care',
    'Education',
    'Travel',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!category) {
      setError('Please select a category');
      return;
    }
    
    // Validate that the date is within the selected month/year
    const selectedDate = new Date(date);
    if (selectedDate.getMonth() + 1 !== selectedMonth || selectedDate.getFullYear() !== selectedYear) {
      setError(`Date must be within ${selectedMonth}/${selectedYear}`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await createTransaction({
        amount: parseFloat(amount),
        category,
        description,
        date: date.toISOString()
      });
      
      // Call onSave to refresh data in parent component
      if (onSave) {
        onSave();
      }
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Error creating transaction:', error);
      setError('Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the first and last day of the selected month
  const getFirstDayOfMonth = () => {
    return new Date(selectedYear, selectedMonth - 1, 1);
  };

  const getLastDayOfMonth = () => {
    return new Date(selectedYear, selectedMonth, 0);
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
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Record Expense for {getMonthName(selectedMonth)} {selectedYear}</h2>
          <button 
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#ffebee', color: '#c62828', marginBottom: '15px', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="amount">Amount ($)</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              disabled={!!error && error.includes('not available')}
            />
          </div>
          
          <div>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={!!error && error.includes('not available')}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="description">Description (optional)</label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Grocery shopping"
              disabled={!!error && error.includes('not available')}
            />
          </div>
          
          <div>
            <label htmlFor="date">Date (Must be in {
              new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })
            } {selectedYear})</label>
            <DatePicker
              id="date"
              selected={date}
              onChange={setDate}
              dateFormat="MM/dd/yyyy"
              minDate={getFirstDayOfMonth()}
              maxDate={getLastDayOfMonth() > new Date() ? new Date() : getLastDayOfMonth()}
              todayButton="Today"
              calendarStartDay={0}
              disabled={!!error && error.includes('not available')}
            />
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ marginRight: '10px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || (!!error && error.includes('not available'))}
            >
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
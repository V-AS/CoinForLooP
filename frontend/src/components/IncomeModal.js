// frontend/src/components/IncomeModal.js
import React, { useState } from 'react';
import { updateIncome } from '../api';

const IncomeModal = ({ onClose, onSave, currentIncome = 0 }) => {
  const [income, setIncome] = useState(currentIncome.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!income || isNaN(income) || parseFloat(income) < 0) {
      setError('Please enter a valid income amount');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await updateIncome({
        income: parseFloat(income)
      });
      
      // Call onSave to refresh data in parent component
      if (onSave) {
        onSave();
      }
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Error updating income:', error);
      setError('Failed to update income. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Set Monthly Income</h2>
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
            <label htmlFor="income">Monthly Income ($)</label>
            <input
              id="income"
              type="number"
              step="0.01"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="0.00"
              required
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeModal;
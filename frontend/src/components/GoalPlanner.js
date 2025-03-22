// frontend/src/components/GoalPlanner.js
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createGoal, getGoals } from '../api';

const GoalPlanner = () => {
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const goalsData = await getGoals();
        setGoals(goalsData);
      } catch (error) {
        console.error('Error fetching goals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!description.trim()) {
      setError('Please enter a goal description');
      return;
    }
    
    if (!targetAmount || isNaN(targetAmount) || parseFloat(targetAmount) <= 0) {
      setError('Please enter a valid target amount');
      return;
    }
    
    if (!deadline) {
      setError('Please select a deadline');
      return;
    }
    
    // Ensure deadline is in the future
    if (deadline < new Date()) {
      setError('Deadline must be in the future');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const newGoal = await createGoal({
        description,
        target_amount: parseFloat(targetAmount),
        deadline: deadline.toISOString()
      });
      
      // Update goals list
      setGoals([...goals, newGoal]);
      
      // Reset form
      setDescription('');
      setTargetAmount('');
      setDeadline(new Date());
      
      // Show success message
      setSuccess('Your goal has been created successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Error creating goal:', error);
      setError('Failed to create goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Financial Goal Planner</h2>
      
      <div className="card">
        <h3>Set a New Financial Goal</h3>
        
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#ffebee', color: '#c62828', marginBottom: '15px', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ padding: '10px', backgroundColor: '#e8f5e9', color: '#2e7d32', marginBottom: '15px', borderRadius: '4px' }}>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="description">Goal Description</label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Buy a laptop, Save for vacation"
              required
            />
          </div>
          
          <div>
            <label htmlFor="targetAmount">Target Amount ($)</label>
            <input
              id="targetAmount"
              type="number"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          
          <div>
            <label htmlFor="deadline">Target Date</label>
            <DatePicker
              id="deadline"
              selected={deadline}
              onChange={setDeadline}
              dateFormat="MM/dd/yyyy"
              minDate={new Date()}
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ marginTop: '20px' }}
          >
            {isSubmitting ? 'Creating Goal...' : 'Create Goal'}
          </button>
        </form>
      </div>
      
      {/* Existing Goals */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Your Financial Goals</h3>
        
        {loading ? (
          <p>Loading your goals...</p>
        ) : goals.length > 0 ? (
          goals.map(goal => (
            <div key={goal.id} className="summary-card">
              <h4>{goal.description}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <strong>Target Amount:</strong> ${goal.target_amount.toFixed(2)}
                </div>
                <div>
                  <strong>Deadline:</strong> {new Date(goal.deadline).toLocaleDateString()}
                </div>
              </div>
              
              {goal.ai_plan && (
                <div style={{ backgroundColor: 'var(--secondary)', padding: '15px', borderRadius: '4px' }}>
                  <h5>AI Savings Plan:</h5>
                  <p>{goal.ai_plan}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>You haven't set any financial goals yet.</p>
        )}
      </div>
    </div>
  );
};

export default GoalPlanner;
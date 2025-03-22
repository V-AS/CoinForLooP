// frontend/src/components/GoalPlanner.js
import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createGoal, getGoals, deleteGoal } from '../api';
import { useLocation } from 'react-router-dom';

const GoalPlanner = () => {
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deadlineSortAsc, setDeadlineSortAsc] = useState(true);
  const [recentSortAsc, setRecentSortAsc] = useState(false);

  const financialGoalsRef = useRef(null);
  const location = useLocation();

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

  useEffect(() => {
    if (location.hash === '#your-financial-goals' && financialGoalsRef.current) {
      // Add a small delay to ensure the DOM is fully rendered
      setTimeout(() => {
        financialGoalsRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.hash, loading]);

  const handleDeleteGoal = async (goalId) => {
    try {
      // Call the API to delete the goal
      await deleteGoal(goalId);

      // Filter out the deleted goal from state
      const updatedGoals = goals.filter(goal => goal.id !== goalId);
      setGoals(updatedGoals);

      // Show a temporary success message
      setSuccess('Goal deleted successfully');
      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Failed to delete goal. Please try again.');
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };


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
      <div id="your-financial-goals" ref={financialGoalsRef} className="card" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Your Financial Goals</h3>
          <div style={{ display: 'flex', gap: '10px', marginRight: '15px' }}>
            <span style={{ paddingTop: '5px' }}>Sort by:</span>
            <button
              className="btn btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              onClick={() => {
                const sortedGoals = [...goals].sort((a, b) => {
                  const comparison = new Date(a.deadline) - new Date(b.deadline);
                  return deadlineSortAsc ? comparison : -comparison;
                });
                setGoals(sortedGoals);
                setDeadlineSortAsc(!deadlineSortAsc);
              }}
            >
              Deadline
              {deadlineSortAsc ?
                <span style={{ fontSize: '10px' }}>▲</span> :
                <span style={{ fontSize: '10px' }}>▼</span>
              }
            </button>
            <button
              className="btn btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              onClick={() => {
                const sortedGoals = [...goals].sort((a, b) => {
                  const comparison = b.id - a.id;
                  return recentSortAsc ? -comparison : comparison;
                });
                setGoals(sortedGoals);
                setRecentSortAsc(!recentSortAsc);
              }}
            >
              Recent
              {recentSortAsc ?
                <span style={{ fontSize: '10px' }}>▲</span> :
                <span style={{ fontSize: '10px' }}>▼</span>
              }
            </button>
          </div>
        </div>

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

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                <button
                  className="btn"
                  style={{
                    backgroundColor: 'var(--danger)',
                    color: 'white',
                    padding: '6px 12px',
                    fontSize: '14px'
                  }}
                  onClick={() => handleDeleteGoal(goal.id)}
                  aria-label="Delete goal"
                >
                  Delete
                </button>
              </div>
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
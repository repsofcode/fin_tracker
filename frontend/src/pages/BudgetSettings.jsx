// src/pages/BudgetSettings.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

function BudgetSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [budget, setBudget]   = useState('');
  const [current, setCurrent] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Load current budget on mount
  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const response = await api.get('/budget/summary');
        setCurrent(response.data.budget);
        setBudget(response.data.budget);
      } catch (err) {
        setMessage('Failed to load current budget.');
      } finally {
        setFetching(false);
      }
    };
    fetchCurrent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.put('/budget', {
        budget: parseFloat(budget), // backend expects a number
      });
      setCurrent(response.data.budget);
      setMessage('Budget updated successfully!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to update budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '3rem auto', padding: '2.5rem', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Budget Settings</h2>
        <Link to="/dashboard" style={{ color: '#888', fontSize: '14px', textDecoration: 'none' }}>← Dashboard</Link>
      </div>

      {/* Current budget display */}
      {!fetching && current !== null && (
        <div style={{
          padding: '1rem',
          background: '#f5f5f5',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}>
          <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Current Monthly Budget
          </p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: current === 0 ? '#aaa' : '#2196F3' }}>
            {current === 0 ? 'Not set' : `₹${current.toLocaleString()}`}
          </p>
        </div>
      )}

      {fetching && (
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '1.5rem' }}>Loading...</p>
      )}

      {message && (
        <p style={{ textAlign: 'center', color: message.includes('successfully') ? 'green' : 'red', marginBottom: '1rem' }}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            New Monthly Budget (₹)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 20000"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '15px',
              boxSizing: 'border-box',
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || fetching}
          style={{
            width: '100%',
            padding: '14px',
            background: loading || fetching ? '#999' : '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: loading || fetching ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Saving...' : 'Update Budget'}
        </button>
      </form>

      {/* Quick links */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '1.5rem' }}>
        <Link to="/expenses" style={{ color: '#2196F3', fontSize: '14px' }}>View Expenses</Link>
        <Link to="/expenses/add" style={{ color: '#4CAF50', fontSize: '14px' }}>Add Expense</Link>
      </div>

    </div>
  );
}

export default BudgetSettings;

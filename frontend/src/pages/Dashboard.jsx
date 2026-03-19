// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/budget/summary');
        setSummary(response.data);
      } catch (err) {
        setError('Failed to load summary. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const statusColor = {
    Comfortable: '#4CAF50',
    Tight:       '#FF9800',
    Difficult:   '#FF5722',
    Overspending:'#F44336',
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Hi, {user?.name} 👋</h2>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>Here's your financial overview</p>
        </div>
        <button
          onClick={logout}
          style={{ padding: '8px 16px', background: '#f44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '2rem' }}>
        <Link to="/expenses" style={navStyle('#2196F3')}>View Expenses</Link>
        <Link to="/expenses/add" style={navStyle('#4CAF50')}>+ Add Expense</Link>
        <Link to="/budget" style={navStyle('#9C27B0')}>Set Budget</Link>
      </div>

      {/* Summary cards */}
      {loading && <p style={{ textAlign: 'center', color: '#888' }}>Loading summary...</p>}
      {error   && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

      {summary && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

            <div style={cardStyle}>
              <p style={cardLabel}>Monthly Budget</p>
              <p style={cardValue('#2196F3')}>₹{summary.budget.toLocaleString()}</p>
            </div>

            <div style={cardStyle}>
              <p style={cardLabel}>Total Spent</p>
              <p style={cardValue('#F44336')}>₹{summary.totalExpenses.toLocaleString()}</p>
            </div>

            <div style={cardStyle}>
              <p style={cardLabel}>Remaining</p>
              <p style={cardValue(summary.remaining >= 0 ? '#4CAF50' : '#F44336')}>
                ₹{summary.remaining.toLocaleString()}
              </p>
            </div>

            <div style={cardStyle}>
              <p style={cardLabel}>Status</p>
              <p style={cardValue(statusColor[summary.status] || '#888')}>
                {summary.status}
              </p>
            </div>

          </div>

          {/* Month label */}
          <p style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', marginTop: '0.5rem' }}>
            Showing data for {summary.month}
          </p>
        </>
      )}

      {/* Quick action if no budget set */}
      {summary && summary.budget === 0 && (
        <div style={{
          marginTop: '1.5rem', padding: '1rem', background: '#fff8e1',
          border: '1px solid #FFD54F', borderRadius: '8px', textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 8px', color: '#795548' }}>You haven't set a monthly budget yet.</p>
          <Link to="/budget" style={{ color: '#FF9800', fontWeight: 'bold' }}>Set your budget →</Link>
        </div>
      )}

    </div>
  );
}

// ── Small style helpers ───────────────────────────────────────────────────────
const cardStyle = {
  padding: '1.5rem',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  textAlign: 'center',
};

const cardLabel = {
  margin: '0 0 8px',
  fontSize: '13px',
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const cardValue = (color) => ({
  margin: 0,
  fontSize: '28px',
  fontWeight: 'bold',
  color,
});

const navStyle = (color) => ({
  padding: '10px 18px',
  background: color,
  color: 'white',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 'bold',
});

export default Dashboard;

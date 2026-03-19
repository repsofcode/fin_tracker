// src/pages/Expenses.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

function Expenses() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [month, setMonth]         = useState('');
  const [category, setCategory]   = useState('');
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10 };
      if (month)    params.month    = month;
      if (category) params.category = category;

      const response = await api.get('/expenses', { params });
      setExpenses(response.data.expenses);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, month, category]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses(); // refresh list after delete
    } catch (err) {
      alert('Failed to delete expense. Please try again.');
    }
  };

  const handleFilterReset = () => {
    setMonth('');
    setCategory('');
    setPage(1);
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>My Expenses</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/dashboard" style={btnStyle('#888')}>← Dashboard</Link>
          <Link to="/expenses/add" style={btnStyle('#4CAF50')}>+ Add</Link>
          <button onClick={logout} style={{ ...btnStyle('#f44336'), border: 'none', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="month"
          value={month}
          onChange={(e) => { setMonth(e.target.value); setPage(1); }}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Filter by category..."
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          style={{ ...inputStyle, minWidth: '180px' }}
        />
        {(month || category) && (
          <button onClick={handleFilterReset} style={{ ...btnStyle('#FF9800'), border: 'none', cursor: 'pointer' }}>
            Clear filters
          </button>
        )}
      </div>

      {/* States */}
      {loading && <p style={{ textAlign: 'center', color: '#888' }}>Loading expenses...</p>}
      {error   && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

      {/* Empty state */}
      {!loading && !error && expenses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
          <p style={{ fontSize: '18px' }}>No expenses found.</p>
          <Link to="/expenses/add" style={{ color: '#4CAF50', fontWeight: 'bold' }}>Add your first expense →</Link>
        </div>
      )}

      {/* Expense list */}
      {!loading && expenses.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {expenses.map((expense) => (
            <div key={expense._id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '16px' }}>
                    {expense.category}
                  </p>
                  {expense.description && (
                    <p style={{ margin: '0 0 4px', color: '#666', fontSize: '14px' }}>
                      {expense.description}
                    </p>
                  )}
                  <p style={{ margin: 0, color: '#aaa', fontSize: '13px' }}>
                    {new Date(expense.date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 'bold', color: '#F44336' }}>
                    ₹{expense.amount.toLocaleString()}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => navigate(`/expenses/edit/${expense._id}`)}
                      style={{ ...btnStyle('#2196F3'), border: 'none', cursor: 'pointer', fontSize: '13px', padding: '6px 12px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      style={{ ...btnStyle('#F44336'), border: 'none', cursor: 'pointer', fontSize: '13px', padding: '6px 12px' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '2rem' }}>
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            style={{ ...btnStyle('#888'), border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
          >
            ← Prev
          </button>
          <span style={{ color: '#888', fontSize: '14px' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
            disabled={page === pagination.totalPages}
            style={{ ...btnStyle('#888'), border: 'none', cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer', opacity: page === pagination.totalPages ? 0.5 : 1 }}
          >
            Next →
          </button>
        </div>
      )}

    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────
const cardStyle = {
  padding: '1.2rem',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
};

const btnStyle = (bg) => ({
  padding: '8px 14px',
  background: bg,
  color: 'white',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '14px',
});

const inputStyle = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '14px',
};

export default Expenses;

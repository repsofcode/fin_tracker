// src/pages/EditExpense.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';

function EditExpense() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [amount, setAmount]           = useState('');
  const [category, setCategory]       = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate]               = useState('');
  const [message, setMessage]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [fetching, setFetching]       = useState(true);
  const [error, setError]             = useState('');

  // Load existing expense data on mount
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const response = await api.get(`/expenses/${id}`);
        const e = response.data.expense;
        setAmount(e.amount);
        setCategory(e.category);
        setDescription(e.description || '');
        // Format date to YYYY-MM-DD for the date input
        setDate(new Date(e.date).toISOString().split('T')[0]);
      } catch (err) {
        setError('Failed to load expense. It may have been deleted.');
      } finally {
        setFetching(false);
      }
    };
    fetchExpense();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.put(`/expenses/${id}`, {
        amount:      parseFloat(amount), // backend expects a number, not a string
        category:    category.trim(),
        description: description.trim(),
        date,
      });
      setMessage('Expense updated successfully!');
      setTimeout(() => navigate('/expenses'), 800);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to update expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while fetching expense
  if (fetching) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
        Loading expense...
      </div>
    );
  }

  // Error state if expense not found
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
        <Link to="/expenses" style={{ color: '#2196F3' }}>← Back to expenses</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '480px', margin: '3rem auto', padding: '2.5rem', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Edit Expense</h2>
        <Link to="/expenses" style={{ color: '#888', fontSize: '14px', textDecoration: 'none' }}>← Back</Link>
      </div>

      {message && (
        <p style={{ textAlign: 'center', color: message.includes('successfully') ? 'green' : 'red', marginBottom: '1rem' }}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        <div style={fieldStyle}>
          <label style={labelStyle}>Amount (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Description <span style={{ color: '#aaa' }}>(optional)</span></label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#999' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

      </form>
    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────
const fieldStyle = { marginBottom: '1.2rem' };

const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '14px' };

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '15px',
  boxSizing: 'border-box',
};

export default EditExpense;

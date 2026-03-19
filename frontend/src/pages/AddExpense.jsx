// src/pages/AddExpense.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function AddExpense() {
  const navigate = useNavigate();

  const [amount, setAmount]           = useState('');
  const [category, setCategory]       = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate]               = useState('');
  const [message, setMessage]         = useState('');
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/expenses', {
        amount:      parseFloat(amount), // backend expects a number, not a string
        category:    category.trim(),
        description: description.trim(),
        date,
      });
      setMessage('Expense added successfully!');
      setTimeout(() => navigate('/expenses'), 800);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '3rem auto', padding: '2.5rem', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Add Expense</h2>
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
            placeholder="e.g. 500"
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
            placeholder="e.g. Food, Transport, Rent"
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
            placeholder="e.g. Lunch at restaurant"
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
            background: loading ? '#999' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Adding...' : 'Add Expense'}
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

export default AddExpense;

// src/pages/Login.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage]   = useState('');
  const { login, loading }      = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const result = await login(email, password);
    if (!result.success) {
      setMessage(result.error);
    }
  };

  return (
    <div style={{
      maxWidth: '420px',
      margin: '4rem auto',
      padding: '2.5rem',
      border: '1px solid #ddd',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Login</h2>

      {message && (
        <p style={{
          textAlign: 'center',
          color: 'red',
          marginBottom: '1rem'
        }}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            required
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
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
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        Don't have an account? <Link to="/register" style={{ color: '#4CAF50' }}>Register here</Link>
      </p>
    </div>
  );
}

export default Login;

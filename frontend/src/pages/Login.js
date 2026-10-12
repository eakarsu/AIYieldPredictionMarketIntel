import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { login } from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      toast.success('Welcome to AgriYield AI!');
      onLogin(res.data.token);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoEmail = process.env.REACT_APP_DEMO_EMAIL;
  const demoPassword = process.env.REACT_APP_DEMO_PASSWORD;
  const demoAvailable = Boolean(demoEmail && demoPassword);
  const fillCredentials = () => {
    if (!demoAvailable) return;
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌾</div>
          <h1>AgriYield AI</h1>
          <p>Yield Prediction & Market Intelligence Platform</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <button type="button" className="btn btn-fill" onClick={fillCredentials} disabled={loading || !demoAvailable}>Fill demo credentials</button>
          {!demoAvailable && <p role="status">Demo credentials are not configured for this frontend. Sign in with an existing account.</p>}
        </form>
      </div>
    </div>
  );
}

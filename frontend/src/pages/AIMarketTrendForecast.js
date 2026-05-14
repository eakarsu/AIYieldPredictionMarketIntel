import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { aiMarketTrendForecast } from '../services/api';

export default function AIMarketTrendForecast({ onLogout }) {
  const [form, setForm] = useState({
    commodity: '',
    market: '',
    horizon: '6 months',
    current_price: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const { data } = await aiMarketTrendForecast({
        ...form,
        current_price: Number(form.current_price) || undefined,
      });
      setResult(data);
      toast.success('Forecast generated');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Request failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <span style={{ fontSize: 24 }}>🌾</span>
          <h2>AgriYield AI</h2>
        </Link>
        <div className="navbar-right">
          <span className="navbar-user">AI Tools</span>
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard">
        <div className="dashboard-header">
          <h1>📈 AI Market Trend Forecast</h1>
          <p>Ad-hoc market trend forecast for any commodity.</p>
        </div>

        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div className="form-group"><label>Commodity *</label><input value={form.commodity} onChange={set('commodity')} placeholder="e.g. corn" required /></div>
              <div className="form-group"><label>Market</label><input value={form.market} onChange={set('market')} placeholder="e.g. CBOT, EU spot" /></div>
              <div className="form-group"><label>Horizon</label><input value={form.horizon} onChange={set('horizon')} placeholder="e.g. 6 months" /></div>
              <div className="form-group"><label>Current Price</label><input type="number" step="0.01" value={form.current_price} onChange={set('current_price')} /></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Context Notes</label>
                <textarea rows={4} value={form.notes} onChange={set('notes')} placeholder="Recent supply shocks, policy changes, weather..." />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Forecasting…' : 'Forecast Trend'}
              </button>
            </div>
          </form>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {result && (
          <div className="card" style={{ padding: 20 }}>
            <h3>Trend Forecast</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}>
              {typeof (result.forecast || result.result) === 'string'
                ? (result.forecast || result.result)
                : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

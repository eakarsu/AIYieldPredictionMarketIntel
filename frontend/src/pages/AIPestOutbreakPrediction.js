import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { aiPestOutbreakPrediction } from '../services/api';

export default function AIPestOutbreakPrediction({ onLogout }) {
  const [form, setForm] = useState({
    crop: '',
    region: '',
    horizon_days: 30,
    weather_summary: '',
    recent_observations: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const { data } = await aiPestOutbreakPrediction({
        ...form,
        horizon_days: Number(form.horizon_days) || 30,
      });
      setResult(data);
      toast.success('Pest outbreak risk computed');
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
          <h1>🐛 AI Pest Outbreak Prediction</h1>
          <p>Pest-outbreak risk over a configurable horizon.</p>
        </div>

        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div className="form-group"><label>Crop *</label><input value={form.crop} onChange={set('crop')} required /></div>
              <div className="form-group"><label>Region</label><input value={form.region} onChange={set('region')} /></div>
              <div className="form-group"><label>Horizon (days)</label><input type="number" value={form.horizon_days} onChange={set('horizon_days')} /></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Weather Summary</label>
                <textarea rows={3} value={form.weather_summary} onChange={set('weather_summary')} placeholder="Temperature, humidity, recent rainfall..." />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Recent Observations</label>
                <textarea rows={3} value={form.recent_observations} onChange={set('recent_observations')} placeholder="Field scouting notes, pheromone trap counts..." />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Predicting…' : 'Predict Outbreak Risk'}
              </button>
            </div>
          </form>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {result && (
          <div className="card" style={{ padding: 20 }}>
            <h3>Outbreak Risk Forecast</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}>
              {typeof (result.prediction || result.result) === 'string'
                ? (result.prediction || result.result)
                : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

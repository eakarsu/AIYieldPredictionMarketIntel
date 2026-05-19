import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { aiYieldPrediction } from '../services/api';

export default function AIYieldPrediction({ onLogout }) {
  const [form, setForm] = useState({
    farm_name: '',
    crop_type: '',
    season: '',
    acreage: '',
    soil_type: '',
    irrigation_type: '',
    historical_notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const { data } = await aiYieldPrediction({
        ...form,
        acreage: Number(form.acreage) || undefined,
      });
      setResult(data);
      toast.success('Prediction generated');
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
          <h1>📊 AI Yield Prediction</h1>
          <p>Ad-hoc crop yield forecast based on inputs (no record required).</p>
        </div>

        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div className="form-group"><label>Farm Name</label><input value={form.farm_name} onChange={set('farm_name')} /></div>
              <div className="form-group"><label>Crop Type *</label><input value={form.crop_type} onChange={set('crop_type')} required /></div>
              <div className="form-group"><label>Season</label><input value={form.season} onChange={set('season')} placeholder="e.g. 2026 spring" /></div>
              <div className="form-group"><label>Acreage</label><input type="number" value={form.acreage} onChange={set('acreage')} /></div>
              <div className="form-group"><label>Soil Type</label><input value={form.soil_type} onChange={set('soil_type')} placeholder="e.g. loam" /></div>
              <div className="form-group"><label>Irrigation Type</label><input value={form.irrigation_type} onChange={set('irrigation_type')} placeholder="e.g. drip" /></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Historical / Context Notes</label>
                <textarea rows={4} value={form.historical_notes} onChange={set('historical_notes')} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Predicting…' : 'Predict Yield'}
              </button>
            </div>
          </form>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {result && (
          <div className="card" style={{ padding: 20 }}>
            <h3>AI Yield Prediction</h3>
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

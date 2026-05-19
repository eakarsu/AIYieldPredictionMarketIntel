import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { aiSoilAmendment } from '../services/api';

export default function AISoilAmendment({ onLogout }) {
  const [form, setForm] = useState({
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    organicMatterPct: '',
    moisturePct: '',
    targetCrop: '',
    acreage: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === '' ? undefined : (k === 'targetCrop' ? v : Number(v))])
      );
      payload.targetCrop = form.targetCrop || undefined;
      const { data } = await aiSoilAmendment(payload);
      setResult(data);
      toast.success('Soil amendment plan generated');
    } catch (err) {
      const status = err.response?.status;
      const msg = status === 503
        ? (err.response?.data?.error || 'AI service unavailable: missing OPENROUTER_API_KEY')
        : (err.response?.data?.error || err.message || 'Request failed');
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
          <h1>🌱 AI Soil Amendment</h1>
          <p>Recommend soil amendments and application schedule from soil-test results.</p>
        </div>

        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div className="form-group"><label>pH</label><input type="number" step="0.1" value={form.ph} onChange={set('ph')} /></div>
              <div className="form-group"><label>Nitrogen (ppm)</label><input type="number" value={form.nitrogen} onChange={set('nitrogen')} /></div>
              <div className="form-group"><label>Phosphorus (ppm)</label><input type="number" value={form.phosphorus} onChange={set('phosphorus')} /></div>
              <div className="form-group"><label>Potassium (ppm)</label><input type="number" value={form.potassium} onChange={set('potassium')} /></div>
              <div className="form-group"><label>Organic Matter %</label><input type="number" step="0.1" value={form.organicMatterPct} onChange={set('organicMatterPct')} /></div>
              <div className="form-group"><label>Moisture %</label><input type="number" step="0.1" value={form.moisturePct} onChange={set('moisturePct')} /></div>
              <div className="form-group"><label>Target Crop *</label><input value={form.targetCrop} onChange={set('targetCrop')} required /></div>
              <div className="form-group"><label>Acreage</label><input type="number" value={form.acreage} onChange={set('acreage')} /></div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Analyzing…' : 'Recommend Amendments'}
              </button>
            </div>
          </form>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {result && (
          <div className="card" style={{ padding: 20 }}>
            <h3>Soil Amendment Plan</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}>
              {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

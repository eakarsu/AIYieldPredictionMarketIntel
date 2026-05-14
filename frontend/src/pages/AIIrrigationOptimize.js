import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { aiIrrigationOptimize } from '../services/api';

export default function AIIrrigationOptimize({ onLogout }) {
  const [form, setForm] = useState({
    crop: '',
    acreage: '',
    soilType: '',
    irrigationMethod: '',
    recentRainfallMm: '',
    forecastRainfallMm: '',
    growthStage: '',
    region: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const payload = {
        ...form,
        acreage: form.acreage ? Number(form.acreage) : undefined,
        recentRainfallMm: form.recentRainfallMm ? Number(form.recentRainfallMm) : undefined,
        forecastRainfallMm: form.forecastRainfallMm ? Number(form.forecastRainfallMm) : undefined,
      };
      const { data } = await aiIrrigationOptimize(payload);
      setResult(data);
      toast.success('Irrigation plan generated');
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
          <h1>💧 AI Irrigation Optimize</h1>
          <p>Generate an optimal irrigation schedule given crop, soil, and forecast inputs.</p>
        </div>

        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div className="form-group"><label>Crop *</label><input value={form.crop} onChange={set('crop')} required /></div>
              <div className="form-group"><label>Acreage</label><input type="number" value={form.acreage} onChange={set('acreage')} /></div>
              <div className="form-group"><label>Soil Type</label><input value={form.soilType} onChange={set('soilType')} placeholder="loam, clay, sandy..." /></div>
              <div className="form-group"><label>Current Method</label><input value={form.irrigationMethod} onChange={set('irrigationMethod')} placeholder="drip, sprinkler, flood..." /></div>
              <div className="form-group"><label>Recent 7-day Rainfall (mm)</label><input type="number" value={form.recentRainfallMm} onChange={set('recentRainfallMm')} /></div>
              <div className="form-group"><label>Forecast 7-day Rainfall (mm)</label><input type="number" value={form.forecastRainfallMm} onChange={set('forecastRainfallMm')} /></div>
              <div className="form-group"><label>Growth Stage</label><input value={form.growthStage} onChange={set('growthStage')} placeholder="vegetative, flowering, grain-fill..." /></div>
              <div className="form-group"><label>Region</label><input value={form.region} onChange={set('region')} /></div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Optimizing…' : 'Generate Irrigation Plan'}
              </button>
            </div>
          </form>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {result && (
          <div className="card" style={{ padding: 20 }}>
            <h3>Irrigation Plan</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}>
              {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { aiEquipmentMaintenance } from '../services/api';

export default function AIEquipmentMaintenance({ onLogout }) {
  const [form, setForm] = useState({
    equipmentName: '',
    type: '',
    ageYears: '',
    hoursUsed: '',
    lastService: '',
    knownIssuesCSV: '',
    status: 'operational',
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
        equipmentName: form.equipmentName,
        type: form.type,
        ageYears: form.ageYears ? Number(form.ageYears) : undefined,
        hoursUsed: form.hoursUsed ? Number(form.hoursUsed) : undefined,
        lastService: form.lastService || undefined,
        knownIssues: form.knownIssuesCSV.split(',').map((s) => s.trim()).filter(Boolean),
        status: form.status,
      };
      const { data } = await aiEquipmentMaintenance(payload);
      setResult(data);
      toast.success('Maintenance forecast generated');
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
          <h1>🚜 AI Equipment Maintenance</h1>
          <p>Predict failure risk and schedule preventive maintenance.</p>
        </div>

        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div className="form-group"><label>Equipment Name *</label><input value={form.equipmentName} onChange={set('equipmentName')} required /></div>
              <div className="form-group"><label>Type</label><input value={form.type} onChange={set('type')} placeholder="tractor, combine, sprayer..." /></div>
              <div className="form-group"><label>Age (years)</label><input type="number" value={form.ageYears} onChange={set('ageYears')} /></div>
              <div className="form-group"><label>Hours Used</label><input type="number" value={form.hoursUsed} onChange={set('hoursUsed')} /></div>
              <div className="form-group"><label>Last Service</label><input type="date" value={form.lastService} onChange={set('lastService')} /></div>
              <div className="form-group"><label>Status</label>
                <select value={form.status} onChange={set('status')}>
                  <option value="operational">Operational</option>
                  <option value="degraded">Degraded</option>
                  <option value="needs_attention">Needs Attention</option>
                  <option value="out_of_service">Out of Service</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Known Issues (comma-separated)</label>
                <input value={form.knownIssuesCSV} onChange={set('knownIssuesCSV')} placeholder="oil leak, hydraulic noise, tire wear" />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Forecasting…' : 'Forecast Maintenance'}
              </button>
            </div>
          </form>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {result && (
          <div className="card" style={{ padding: 20 }}>
            <h3>Maintenance Forecast</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}>
              {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

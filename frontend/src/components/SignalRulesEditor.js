import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CONDITIONS = ['price_above', 'price_below', 'pct_change_above', 'pct_change_below', 'volume_above'];
const ACTIONS = ['BUY', 'SELL', 'ALERT', 'HEDGE'];
const COMMODITIES = ['Corn', 'Wheat', 'Soybean', 'Rice', 'Barley', 'Cotton', 'Oats'];

export default function SignalRulesEditor() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', commodity: 'Corn', condition: 'price_above', threshold: '', action: 'ALERT', enabled: true });

  const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/custom-views/signal-rules', authHeader());
      setRules(res.data.data || []);
    } catch (e) { /* noop */ }
    setLoading(false);
  };

  useEffect(() => { fetchRules(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`/api/custom-views/signal-rules/${editing}`, form, authHeader());
      } else {
        await axios.post('/api/custom-views/signal-rules', form, authHeader());
      }
      setForm({ name: '', commodity: 'Corn', condition: 'price_above', threshold: '', action: 'ALERT', enabled: true });
      setEditing(null);
      fetchRules();
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const startEdit = (rule) => {
    setEditing(rule.id);
    setForm({ name: rule.name, commodity: rule.commodity, condition: rule.condition, threshold: rule.threshold, action: rule.action, enabled: rule.enabled });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: '', commodity: 'Corn', condition: 'price_above', threshold: '', action: 'ALERT', enabled: true });
  };

  const deleteRule = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    await axios.delete(`/api/custom-views/signal-rules/${id}`, authHeader());
    fetchRules();
  };

  const toggleEnabled = async (rule) => {
    await axios.put(`/api/custom-views/signal-rules/${rule.id}`, { ...rule, enabled: !rule.enabled }, authHeader());
    fetchRules();
  };

  const inputStyle = { background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '8px 10px', borderRadius: 6, width: '100%' };

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
      <h3 style={{ color: '#f1f5f9', marginBottom: 4 }}>Signal / Threshold Rules Editor</h3>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Define price-triggered rules for commodity alerts and trade signals.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr auto', gap: 8, marginBottom: 18, alignItems: 'end' }}>
        <div>
          <label style={{ color: '#94a3b8', fontSize: 11, display: 'block', marginBottom: 4 }}>Rule Name</label>
          <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Corn Bullish" required />
        </div>
        <div>
          <label style={{ color: '#94a3b8', fontSize: 11, display: 'block', marginBottom: 4 }}>Commodity</label>
          <select style={inputStyle} value={form.commodity} onChange={e => setForm({ ...form, commodity: e.target.value })}>
            {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: '#94a3b8', fontSize: 11, display: 'block', marginBottom: 4 }}>Condition</label>
          <select style={inputStyle} value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: '#94a3b8', fontSize: 11, display: 'block', marginBottom: 4 }}>Threshold</label>
          <input style={inputStyle} type="number" step="0.01" value={form.threshold} onChange={e => setForm({ ...form, threshold: e.target.value })} required />
        </div>
        <div>
          <label style={{ color: '#94a3b8', fontSize: 11, display: 'block', marginBottom: 4 }}>Action</label>
          <select style={inputStyle} value={form.action} onChange={e => setForm({ ...form, action: e.target.value })}>
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>{editing ? 'Update' : 'Add'}</button>
          {editing && <button type="button" onClick={cancelEdit} style={{ background: '#475569', color: '#fff', border: 'none', padding: '9px 12px', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>}
        </div>
      </form>

      {loading ? (
        <div style={{ color: '#94a3b8' }}>Loading rules...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f1f5f9', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              <th style={{ padding: 10, textAlign: 'left' }}>Name</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Commodity</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Condition</th>
              <th style={{ padding: 10, textAlign: 'right' }}>Threshold</th>
              <th style={{ padding: 10, textAlign: 'center' }}>Action</th>
              <th style={{ padding: 10, textAlign: 'center' }}>Enabled</th>
              <th style={{ padding: 10, textAlign: 'right' }}>Ops</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: 10 }}>{r.name}</td>
                <td style={{ padding: 10 }}>{r.commodity}</td>
                <td style={{ padding: 10, color: '#94a3b8' }}>{r.condition}</td>
                <td style={{ padding: 10, textAlign: 'right', fontFamily: 'monospace' }}>{r.threshold}</td>
                <td style={{ padding: 10, textAlign: 'center' }}>
                  <span style={{ background: r.action === 'BUY' ? '#10b981' : r.action === 'SELL' ? '#ef4444' : '#3b82f6', color: '#fff', padding: '3px 9px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{r.action}</span>
                </td>
                <td style={{ padding: 10, textAlign: 'center' }}>
                  <button onClick={() => toggleEnabled(r)} style={{ background: r.enabled ? '#10b981' : '#475569', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>{r.enabled ? 'ON' : 'OFF'}</button>
                </td>
                <td style={{ padding: 10, textAlign: 'right' }}>
                  <button onClick={() => startEdit(r)} style={{ marginRight: 6, background: '#3b82f6', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Edit</button>
                  <button onClick={() => deleteRule(r.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Delete</button>
                </td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>No rules yet. Add one above.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

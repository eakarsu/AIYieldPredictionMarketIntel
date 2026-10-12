// // === Batch 09 Gaps & Frontend Mounts ===
import React, { useState } from 'react';
import AIReport from '../../components/AIReport';

export default function MicroclimateModelingForPrecisionAgriculturePage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const r = await fetch('/api/custom/microclimate-modeling-for-precision-agriculture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ prompt: input })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Request failed');
      setResult(data);
    } catch (e) { setError(e.message || 'Error'); }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Microclimate modeling for precision agriculture</h1>
      <p style={{ color: '#666', marginBottom: 16 }}>Generated gap feature for AIYieldPredictionMarketIntel.</p>
      <div className="ai-preset-bar"><div><strong>Example prompts</strong><p>Choose a complete draft prompt, then review it before running AI.</p></div><div className="ai-actions"><button type="button" className="btn btn-secondary" disabled={loading} onClick={() => setInput("Review microclimate modeling for precision agriculture for a 120-acre corn farm in central Iowa. Include current observations, assumptions, practical actions, and what evidence is still needed.")}>Field review</button><button type="button" className="btn btn-secondary" disabled={loading} onClick={() => setInput("Assess microclimate modeling for precision agriculture for an 85-acre rainfed wheat farm in western Kansas. Compare near-term risks, resource limits, and verification steps.")}>Risk review</button><button type="button" className="btn btn-secondary" disabled={loading} onClick={() => setInput("Prepare an executive brief on microclimate modeling for precision agriculture for an 18-acre drip-irrigated tomato operation in California. Show options, tradeoffs, owners, and next steps.")}>Executive brief</button></div></div>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Describe what you need..."
        rows={6}
        style={{ width: '100%', padding: 12, border: '1px solid #ccc', borderRadius: 6, marginBottom: 12 }}
      />
      <button
        onClick={run}
        disabled={loading}
        style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
      >
        {loading ? 'Running...' : 'Run AI'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {result !== null && <AIReport response={result} title="AI result" />}
    </div>
  );
}

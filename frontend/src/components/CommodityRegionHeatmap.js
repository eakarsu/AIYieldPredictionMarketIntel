import React, { useEffect, useState } from 'react';
import axios from 'axios';

function colorFor(v) {
  // 0..100 -> blue->green->yellow->red
  const t = Math.max(0, Math.min(100, v)) / 100;
  const hue = (1 - t) * 220; // 220=blue, 0=red
  return `hsl(${hue}, 65%, ${30 + t * 25}%)`;
}

export default function CommodityRegionHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/custom-views/commodity-region-heatmap', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: 20, color: '#94a3b8' }}>Loading heatmap...</div>;
  if (error) return <div style={{ padding: 20, color: '#ef4444' }}>Error: {error}</div>;
  if (!data) return null;

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
      <h3 style={{ color: '#f1f5f9', marginBottom: 4 }}>Commodity x Region Heatmap</h3>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>{data.legend}</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', color: '#f1f5f9', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ padding: 10, textAlign: 'left', background: '#0f172a', borderBottom: '2px solid #334155' }}>Commodity</th>
              {data.regions.map(r => (
                <th key={r} style={{ padding: 10, textAlign: 'center', background: '#0f172a', borderBottom: '2px solid #334155' }}>{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.matrix.map(row => (
              <tr key={row.commodity}>
                <td style={{ padding: 10, fontWeight: 600, borderBottom: '1px solid #334155' }}>{row.commodity}</td>
                {row.values.map((v, i) => (
                  <td key={i} style={{ padding: 0, borderBottom: '1px solid #334155' }} title={`Price: $${v.price} Vol: ${v.volume}`}>
                    <div style={{ background: colorFor(v.strength), padding: '14px 8px', textAlign: 'center', color: '#fff', fontWeight: 600 }}>
                      {v.strength}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#94a3b8' }}>
        <span>Weak</span>
        <div style={{ flex: 1, height: 10, background: 'linear-gradient(90deg, hsl(220,65%,30%), hsl(140,65%,42%), hsl(60,65%,48%), hsl(0,65%,55%))', borderRadius: 5 }} />
        <span>Strong</span>
      </div>
    </div>
  );
}

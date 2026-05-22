import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, Area, ComposedChart } from 'recharts';

const COLORS = { Corn: '#f59e0b', Wheat: '#d97706', Soybean: '#10b981' };

export default function YieldForecastChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/custom-views/yield-forecast', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: 20, color: '#94a3b8' }}>Loading yield forecast...</div>;
  if (error) return <div style={{ padding: 20, color: '#ef4444' }}>Error: {error}</div>;
  if (!data || !data.series) return null;

  // Merge series into single dataset by month
  const months = data.series[0].data.map(d => d.month);
  const merged = months.map((m, i) => {
    const row = { month: m };
    data.series.forEach(s => {
      row[`${s.crop}_actual`] = s.data[i].actual;
      row[`${s.crop}_forecast`] = s.data[i].forecast;
    });
    return row;
  });

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
      <h3 style={{ color: '#f1f5f9', marginBottom: 4 }}>Yield Forecast (12-Month)</h3>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Unit: {data.unit} - Solid = actual, Dashed = forecast</p>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={merged} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9' }} />
          <Legend />
          {data.series.map(s => (
            <Line key={`${s.crop}-a`} type="monotone" dataKey={`${s.crop}_actual`} stroke={COLORS[s.crop] || '#3b82f6'} strokeWidth={2} dot={{ r: 3 }} name={`${s.crop} Actual`} />
          ))}
          {data.series.map(s => (
            <Line key={`${s.crop}-f`} type="monotone" dataKey={`${s.crop}_forecast`} stroke={COLORS[s.crop] || '#3b82f6'} strokeDasharray="5 5" strokeWidth={2} dot={false} name={`${s.crop} Forecast`} />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

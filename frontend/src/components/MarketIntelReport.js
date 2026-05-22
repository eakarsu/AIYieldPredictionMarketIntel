import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function MarketIntelReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    axios.get('/api/custom-views/market-intel-report', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setReport(res.data.report); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { fetchReport(); }, []);

  const downloadPdf = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/custom-views/market-intel-report?format=pdf', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `market-intel-${report?.period || 'report'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to download PDF: ' + e.message);
    }
  };

  if (loading) return <div style={{ padding: 20, color: '#94a3b8' }}>Loading report...</div>;
  if (error) return <div style={{ padding: 20, color: '#ef4444' }}>Error: {error}</div>;
  if (!report) return null;

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <h3 style={{ color: '#f1f5f9', margin: 0 }}>{report.title}</h3>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: '4px 0 0' }}>Period: {report.period} | Generated: {new Date(report.generated_at).toLocaleString()}</p>
        </div>
        <button onClick={downloadPdf} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
          Download PDF
        </button>
      </div>

      <div style={{ background: '#0f172a', padding: 14, borderRadius: 8, border: '1px solid #334155', marginBottom: 14 }}>
        <h4 style={{ color: '#10b981', margin: '0 0 8px', fontSize: 13, letterSpacing: 1 }}>EXECUTIVE SUMMARY</h4>
        <p style={{ color: '#cbd5e1', margin: 0, lineHeight: 1.6 }}>{report.executive_summary}</p>
      </div>

      {report.sections.map((s, i) => (
        <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #334155' }}>
          <h4 style={{ color: '#f1f5f9', margin: '0 0 6px', fontSize: 14 }}>{s.heading}</h4>
          <p style={{ color: '#cbd5e1', margin: 0, lineHeight: 1.6, fontSize: 14 }}>{s.body}</p>
        </div>
      ))}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 14 }}>
        {Object.entries(report.key_metrics).map(([k, v]) => (
          <div key={k} style={{ background: '#0f172a', padding: 12, borderRadius: 8, border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.replace(/_/g, ' ')}</div>
            <div style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginTop: 4 }}>{typeof v === 'number' && k.includes('price') ? `$${v}` : v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import YieldForecastChart from '../components/YieldForecastChart';
import CommodityRegionHeatmap from '../components/CommodityRegionHeatmap';
import MarketIntelReport from '../components/MarketIntelReport';
import SignalRulesEditor from '../components/SignalRulesEditor';

const VIEWS = [
  { key: 'yield-forecast', label: 'Yield Forecast', icon: '📈' },
  { key: 'heatmap', label: 'Commodity Heatmap', icon: '🔥' },
  { key: 'report', label: 'Market Intel Report', icon: '📄' },
  { key: 'rules', label: 'Signal Rules', icon: '⚡' },
];

export default function CustomViewsPage({ onLogout }) {
  const navigate = useNavigate();
  const [view, setView] = useState('yield-forecast');

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <span style={{ fontSize: 24 }}>🌾</span>
          <h2>AgriYield AI</h2>
        </Link>
        <div className="navbar-right">
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', marginRight: 16 }}>Dashboard</Link>
          <span className="navbar-user">admin@agriyield.com</span>
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 70px)' }}>
        {/* Sidebar */}
        <aside data-testid="market-views-sidebar" style={{ background: '#1e293b', borderRight: '1px solid #334155', padding: '20px 0' }}>
          <div style={{ padding: '0 20px 14px', borderBottom: '1px solid #334155', marginBottom: 14 }}>
            <h3 style={{ color: '#f1f5f9', fontSize: 14, letterSpacing: 1, margin: 0, textTransform: 'uppercase' }}>Market Views</h3>
            <p style={{ color: '#64748b', fontSize: 11, margin: '4px 0 0' }}>Custom intelligence dashboards</p>
          </div>
          {VIEWS.map(v => (
            <button
              key={v.key}
              data-view={v.key}
              onClick={() => setView(v.key)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: view === v.key ? 'rgba(16,185,129,0.12)' : 'transparent',
                color: view === v.key ? '#10b981' : '#cbd5e1',
                border: 'none',
                borderLeft: view === v.key ? '3px solid #10b981' : '3px solid transparent',
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: view === v.key ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 18 }}>{v.icon}</span>
              <span>{v.label}</span>
            </button>
          ))}
          <div style={{ padding: '20px', marginTop: 20, borderTop: '1px solid #334155' }}>
            <button onClick={() => navigate('/')} style={{ background: '#334155', color: '#cbd5e1', border: 'none', padding: '8px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13, width: '100%' }}>
              ← Back to Dashboard
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ color: '#f1f5f9', margin: 0 }}>Market Views</h1>
            <p style={{ color: '#94a3b8', marginTop: 6 }}>Custom yield, price, and signal intelligence views</p>
          </div>

          {view === 'yield-forecast' && <YieldForecastChart />}
          {view === 'heatmap' && <CommodityRegionHeatmap />}
          {view === 'report' && <MarketIntelReport />}
          {view === 'rules' && <SignalRulesEditor />}
        </main>
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard({ features, onLogout }) {
  const navigate = useNavigate();

  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <span style={{ fontSize: 24 }}>🌾</span>
          <h2>AgriYield AI</h2>
        </Link>
        <div className="navbar-right">
          <span className="navbar-user">admin@agriyield.com</span>
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>AI-Powered Agricultural Intelligence Platform - Monitor, Predict, Optimize</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>📊</div>
            <div className="stat-info">
              <h3>15</h3>
              <p>Active Modules</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>🌾</div>
            <div className="stat-info">
              <h3>225+</h3>
              <p>Data Points</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>🤖</div>
            <div className="stat-info">
              <h3>AI</h3>
              <p>OpenRouter Powered</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>💰</div>
            <div className="stat-info">
              <h3>$1B</h3>
              <p>AgriTech Market</p>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Ad-Hoc AI Tools</h2>
        <div className="features-grid" style={{ marginBottom: 32 }}>
          <div className="feature-card" style={{ '--card-color': '#10b981' }} onClick={() => navigate('/ai/yield-prediction')}>
            <div className="feature-card-icon">📊</div>
            <h3>AI Yield Prediction</h3>
            <p>Ad-hoc crop yield forecast (no record required)</p>
            <span className="feature-card-arrow">&rarr;</span>
          </div>
          <div className="feature-card" style={{ '--card-color': '#059669' }} onClick={() => navigate('/ai/market-trend-forecast')}>
            <div className="feature-card-icon">📈</div>
            <h3>AI Market Trend Forecast</h3>
            <p>Commodity market trend forecast for any input</p>
            <span className="feature-card-arrow">&rarr;</span>
          </div>
          <div className="feature-card" style={{ '--card-color': '#ef4444' }} onClick={() => navigate('/ai/pest-outbreak-prediction')}>
            <div className="feature-card-icon">🐛</div>
            <h3>AI Pest Outbreak</h3>
            <p>Pest-outbreak risk over a configurable horizon</p>
            <span className="feature-card-arrow">&rarr;</span>
          </div>
          <div className="feature-card" style={{ '--card-color': '#0ea5e9' }} onClick={() => navigate('/ai/irrigation-optimize')}>
            <div className="feature-card-icon">💧</div>
            <h3>AI Irrigation Optimize</h3>
            <p>Optimal irrigation schedule from crop and weather inputs</p>
            <span className="feature-card-arrow">&rarr;</span>
          </div>
          <div className="feature-card" style={{ '--card-color': '#8b5cf6' }} onClick={() => navigate('/ai/soil-amendment')}>
            <div className="feature-card-icon">🌱</div>
            <h3>AI Soil Amendment</h3>
            <p>Recommend amendments from soil-test results</p>
            <span className="feature-card-arrow">&rarr;</span>
          </div>
          <div className="feature-card" style={{ '--card-color': '#78716c' }} onClick={() => navigate('/ai/equipment-maintenance')}>
            <div className="feature-card-icon">🚜</div>
            <h3>AI Equipment Maintenance</h3>
            <p>Predict equipment failure risk and schedule maintenance</p>
            <span className="feature-card-arrow">&rarr;</span>
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Feature Modules</h2>
        <div className="features-grid">
          {features.map((f) => (
            <div
              key={f.key}
              className="feature-card"
              style={{ '--card-color': f.color }}
              onClick={() => navigate(`/${f.key}`)}
            >
              <div className="feature-card-icon">{f.icon}</div>
              <h3>{f.name}</h3>
              <p>{f.desc}</p>
              <span className="feature-card-arrow">&rarr;</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getItem, updateItem, deleteItem, analyzeItem } from '../services/api';

function formatFieldName(field) {
  return field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function renderAIAnalysis(analysis) {
  if (!analysis) return null;

  if (typeof analysis === 'string') {
    return <div className="ai-text-block">{analysis}</div>;
  }

  if (analysis.analysis && typeof analysis.analysis === 'string') {
    const sections = analysis.analysis.split('\n\n');
    return (
      <div>
        {sections.map((section, i) => {
          const lines = section.split('\n');
          const title = lines[0]?.replace(/^[#*\s]+/, '').replace(/[*#]+/g, '');
          const content = lines.slice(1).join('\n');
          return (
            <div key={i} className="ai-section">
              {title && <div className="ai-section-title">{title}</div>}
              <div className="ai-text-block">{content || title}</div>
            </div>
          );
        })}
      </div>
    );
  }

  // Render object keys as structured cards
  const entries = Object.entries(analysis).filter(([k]) => k !== 'analysis');
  if (entries.length === 0 && analysis.analysis) {
    return renderAIAnalysis(analysis.analysis);
  }

  const simpleEntries = entries.filter(([, v]) => typeof v !== 'object');
  const complexEntries = entries.filter(([, v]) => typeof v === 'object' && v !== null);

  return (
    <div>
      {simpleEntries.length > 0 && (
        <div className="ai-kv-grid" style={{ marginBottom: complexEntries.length > 0 ? 24 : 0 }}>
          {simpleEntries.map(([key, value]) => (
            <div key={key} className="ai-kv-item">
              <div className="kv-label">{formatFieldName(key)}</div>
              <div className="kv-value">{String(value)}</div>
            </div>
          ))}
        </div>
      )}
      {complexEntries.map(([key, value]) => (
        <div key={key} className="ai-section">
          <div className="ai-section-title">{formatFieldName(key)}</div>
          {Array.isArray(value) ? (
            <div className="ai-text-block">
              {value.map((item, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  {typeof item === 'object' ? JSON.stringify(item, null, 2) : `- ${item}`}
                </div>
              ))}
            </div>
          ) : (
            <div className="ai-kv-grid">
              {Object.entries(value).map(([k, v]) => (
                <div key={k} className="ai-kv-item">
                  <div className="kv-label">{formatFieldName(k)}</div>
                  <div className="kv-value">{String(v)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function DetailPage({ feature, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await getItem(feature.key, id);
      setItem(res.data.data);
      setEditData(res.data.data);
    } catch (err) {
      toast.error('Failed to load item');
      navigate(`/${feature.key}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const updateFields = {};
      feature.fields.forEach(f => { updateFields[f] = editData[f]; });
      await updateItem(feature.key, id, updateFields);
      toast.success('Updated successfully');
      setEditMode(false);
      fetchItem();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteItem(feature.key, id);
      toast.success('Deleted successfully');
      navigate(`/${feature.key}`);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleAnalyze = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await analyzeItem(feature.key, id);
      setAiResult(res.data.data.analysis);
      toast.success('AI analysis complete');
    } catch (err) {
      const msg = err.response?.data?.error || 'AI analysis failed';
      toast.error(msg);
      setAiResult({ analysis: `Error: ${msg}. Make sure OPENROUTER_API_KEY is set in .env file.` });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <nav className="navbar">
          <Link to="/" className="navbar-brand"><span style={{ fontSize: 24 }}>🌾</span><h2>AgriYield AI</h2></Link>
          <div className="navbar-right"><button className="btn-logout" onClick={onLogout}>Logout</button></div>
        </nav>
        <div className="detail-container"><div className="ai-loading"><div className="spinner"></div> Loading...</div></div>
      </div>
    );
  }

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

      <div className="detail-container">
        <div style={{ marginBottom: 20 }}>
          <button className="back-btn" onClick={() => navigate(`/${feature.key}`)} style={{ display: 'inline-flex' }}>
            &larr;
          </button>
          <span style={{ marginLeft: 12, color: 'var(--text-muted)', fontSize: 14 }}>
            Back to {feature.name}
          </span>
        </div>

        <div className="detail-card">
          <div className="detail-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{feature.icon}</span>
              <h2>{item[feature.fields[0]] || `${feature.name} #${id}`}</h2>
            </div>
            <div className="detail-card-actions">
              {editMode ? (
                <>
                  <button className="btn btn-success btn-sm" onClick={handleUpdate}>Save</button>
                  <button className="btn btn-outline btn-sm" onClick={() => { setEditMode(false); setEditData(item); }}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="btn btn-ai btn-sm" onClick={handleAnalyze} disabled={aiLoading}>
                    {aiLoading ? 'Analyzing...' : 'AI Analyze'}
                  </button>
                  <button className="btn btn-warning btn-sm" onClick={() => setEditMode(true)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
                </>
              )}
            </div>
          </div>

          <div className="detail-fields">
            {feature.fields.map(f => (
              <div key={f} className="detail-field">
                <label>{formatFieldName(f)}</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editData[f] || ''}
                    onChange={(e) => setEditData({ ...editData, [f]: e.target.value })}
                  />
                ) : (
                  <span>{item[f] || '-'}</span>
                )}
              </div>
            ))}
          </div>

          <div style={{ padding: '16px 32px 24px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>ID: {item.id}</span>
              <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
              <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {(aiResult || aiLoading) && (
          <div className="ai-analysis">
            <div className="ai-analysis-header">
              <span style={{ fontSize: 20 }}>🤖</span>
              <h3>AI Analysis - Powered by OpenRouter</h3>
            </div>
            <div className="ai-analysis-body">
              {aiLoading ? (
                <div className="ai-loading">
                  <div className="spinner"></div>
                  Analyzing with Claude AI...
                </div>
              ) : (
                renderAIAnalysis(aiResult)
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

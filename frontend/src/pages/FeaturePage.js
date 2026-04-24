import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getItems, createItem, deleteItem } from '../services/api';

function formatFieldName(field) {
  return field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getBadgeClass(value) {
  if (!value) return 'badge-neutral';
  const v = String(value).toLowerCase();
  if (['high', 'critical', 'active', 'bullish', 'excellent', 'premium', 'operational'].includes(v)) return 'badge-success';
  if (['medium', 'monitoring', 'neutral', 'good', 'fair', 'in transit', 'intermediate'].includes(v)) return 'badge-warning';
  if (['low', 'poor', 'bearish', 'delayed', 'idle', 'maintenance', 'entry'].includes(v)) return 'badge-danger';
  if (['resolved', 'delivered', 'pending'].includes(v)) return 'badge-info';
  return '';
}

function isBadgeField(field) {
  return ['status', 'severity', 'impact_level', 'risk_level', 'spread_risk', 'trend_direction', 'supply_level', 'demand_level', 'market_demand', 'quality_grade', 'priority', 'crop_health', 'anomaly_detected', 'skill_level', 'risk_assessment'].includes(field);
}

export default function FeaturePage({ feature, onLogout }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({});

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getItems(feature.key, search);
      setItems(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [feature.key, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createItem(feature.key, newItem);
      toast.success('Item created successfully');
      setShowModal(false);
      setNewItem({});
      fetchItems();
    } catch (err) {
      toast.error('Failed to create item');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteItem(feature.key, id);
      toast.success('Item deleted');
      fetchItems();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const displayFields = feature.fields.slice(0, 5);

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

      <div className="page-container">
        <div className="page-header">
          <div className="page-header-left">
            <button className="back-btn" onClick={() => navigate('/')}>&larr;</button>
            <span style={{ fontSize: 28 }}>{feature.icon}</span>
            <h1 className="page-title">{feature.name}</h1>
          </div>
          <div className="page-header-right">
            <input
              className="search-input"
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-success btn-sm" onClick={() => setShowModal(true)}>
              + New Item
            </button>
          </div>
        </div>

        <div className="data-table-container">
          {loading ? (
            <div className="ai-loading"><div className="spinner"></div> Loading...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">{feature.icon}</div>
              <h3>No data found</h3>
              <p>Create your first item to get started</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  {displayFields.map(f => <th key={f}>{formatFieldName(f)}</th>)}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} onClick={() => navigate(`/${feature.key}/${item.id}`)}>
                    <td>{idx + 1}</td>
                    {displayFields.map(f => (
                      <td key={f}>
                        {isBadgeField(f) ? (
                          <span className={`badge ${getBadgeClass(item[f])}`}>{item[f] || '-'}</span>
                        ) : (
                          item[f] || '-'
                        )}
                      </td>
                    ))}
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={(e) => handleDelete(e, item.id)}
                        style={{ padding: '4px 12px', fontSize: 12 }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New {feature.name.replace(/s$/, '')}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {feature.fields.map(f => (
                  <div className="form-group" key={f}>
                    <label>{formatFieldName(f)}</label>
                    <input
                      type="text"
                      value={newItem[f] || ''}
                      onChange={(e) => setNewItem({ ...newItem, [f]: e.target.value })}
                      placeholder={`Enter ${formatFieldName(f).toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success btn-sm">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

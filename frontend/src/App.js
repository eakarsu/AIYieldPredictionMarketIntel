import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import DetailPage from './pages/DetailPage';
import AIYieldPrediction from './pages/AIYieldPrediction';
import AIMarketTrendForecast from './pages/AIMarketTrendForecast';
import AIPestOutbreakPrediction from './pages/AIPestOutbreakPrediction';
import AIIrrigationOptimize from './pages/AIIrrigationOptimize';
import AISoilAmendment from './pages/AISoilAmendment';
import AIEquipmentMaintenance from './pages/AIEquipmentMaintenance';
import CustomViewsPage from './pages/CustomViewsPage';

const features = [
  { key: 'yield-predictions', name: 'Yield Predictions', icon: '📊', color: '#10b981', desc: 'AI-powered crop yield forecasting', fields: ['farm_name','crop_type','predicted_yield','confidence','season','acreage','soil_type','irrigation_type'] },
  { key: 'market-prices', name: 'Market Prices', icon: '💰', color: '#f59e0b', desc: 'Real-time commodity price tracking', fields: ['commodity','current_price','predicted_price','change_percent','market','supply_level','demand_level','unit'] },
  { key: 'weather-analysis', name: 'Weather Analysis', icon: '🌤️', color: '#3b82f6', desc: 'Weather impact on crop production', fields: ['location','temperature','humidity','rainfall','wind_speed','forecast','impact_level','crop_affected'] },
  { key: 'soil-health', name: 'Soil Health', icon: '🌱', color: '#8b5cf6', desc: 'Soil quality monitoring & analysis', fields: ['farm_name','ph_level','nitrogen','phosphorus','potassium','organic_matter','moisture','health_score'] },
  { key: 'crop-recommendations', name: 'Crop Recommendations', icon: '🌾', color: '#06b6d4', desc: 'AI crop selection optimization', fields: ['region','recommended_crop','expected_roi','growth_period','water_needs','soil_requirement','market_demand','risk_level'] },
  { key: 'pest-alerts', name: 'Pest & Disease Alerts', icon: '🐛', color: '#ef4444', desc: 'Early pest detection & prevention', fields: ['pest_name','crop_affected','severity','location','detection_date','treatment','spread_risk','status'] },
  { key: 'irrigation-plans', name: 'Irrigation Plans', icon: '💧', color: '#0ea5e9', desc: 'Smart water management', fields: ['farm_name','crop_type','water_requirement','schedule','efficiency_score','method','cost_estimate','season'] },
  { key: 'harvest-plans', name: 'Harvest Planning', icon: '🚜', color: '#d97706', desc: 'Optimal harvest timing & logistics', fields: ['farm_name','crop_type','optimal_date','expected_quantity','quality_grade','market_window','storage_needed','priority'] },
  { key: 'market-trends', name: 'Market Trends', icon: '📈', color: '#059669', desc: 'Commodity market trend analysis', fields: ['commodity','trend_direction','price_change','volume_change','period','market','forecast_accuracy','analysis'] },
  { key: 'supply-chain', name: 'Supply Chain', icon: '🚛', color: '#7c3aed', desc: 'Supply chain optimization', fields: ['product','origin','destination','transit_time','cost','status','carrier','quantity'] },
  { key: 'financial-plans', name: 'Financial Planning', icon: '📋', color: '#dc2626', desc: 'Farm financial projections', fields: ['farm_name','budget','revenue_forecast','expense_forecast','profit_margin','roi','risk_assessment','period'] },
  { key: 'satellite-data', name: 'Satellite Imagery', icon: '🛰️', color: '#4f46e5', desc: 'Remote sensing crop analysis', fields: ['farm_name','ndvi_index','crop_health','area_coverage','capture_date','resolution','anomaly_detected','recommendations'] },
  { key: 'equipment', name: 'Equipment Management', icon: '⚙️', color: '#78716c', desc: 'Farm equipment tracking', fields: ['name','type','status','last_maintenance','next_maintenance','cost_per_hour','utilization_rate','farm_assigned'] },
  { key: 'labor-plans', name: 'Labor Planning', icon: '👷', color: '#0d9488', desc: 'Workforce optimization', fields: ['task_name','workers_needed','skill_level','duration','cost_estimate','season','priority','department'] },
  { key: 'sustainability', name: 'Sustainability Metrics', icon: '🌍', color: '#16a34a', desc: 'Environmental impact tracking', fields: ['farm_name','carbon_footprint','water_usage','biodiversity_score','renewable_energy','waste_reduction','certification','overall_score'] },
];

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route path="/" element={token ? <Dashboard features={features} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        {features.map(f => (
          <React.Fragment key={f.key}>
            <Route path={`/${f.key}`} element={token ? <FeaturePage feature={f} onLogout={handleLogout} /> : <Navigate to="/login" />} />
            <Route path={`/${f.key}/:id`} element={token ? <DetailPage feature={f} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          </React.Fragment>
        ))}
        <Route path="/ai/yield-prediction" element={token ? <AIYieldPrediction onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/ai/market-trend-forecast" element={token ? <AIMarketTrendForecast onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/ai/pest-outbreak-prediction" element={token ? <AIPestOutbreakPrediction onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/ai/irrigation-optimize" element={token ? <AIIrrigationOptimize onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/ai/soil-amendment" element={token ? <AISoilAmendment onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/ai/equipment-maintenance" element={token ? <AIEquipmentMaintenance onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/custom-views" element={token ? <CustomViewsPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

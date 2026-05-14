const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'agriyield_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

const S = DataTypes.STRING;
const F = DataTypes.FLOAT;
const I = DataTypes.INTEGER;
const D = DataTypes.DATE;
const BOOL = DataTypes.BOOLEAN;
const TEXT = DataTypes.TEXT;
const JSONB = DataTypes.JSONB;

const YieldPrediction = sequelize.define('YieldPrediction', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  farm_name: S,
  crop_type: S,
  predicted_yield: F,
  confidence: F,
  season: S,
  acreage: F,
  soil_type: S,
  irrigation_type: S,
  field_id: S,
});

const MarketPrice = sequelize.define('MarketPrice', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  commodity: S,
  current_price: F,
  predicted_price: F,
  change_percent: F,
  market: S,
  supply_level: S,
  demand_level: S,
  unit: S,
  alert_threshold: F,
  alert_active: { type: BOOL, defaultValue: false },
});

const WeatherAnalysis = sequelize.define('WeatherAnalysis', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  location: S,
  temperature: F,
  humidity: F,
  rainfall: F,
  wind_speed: F,
  forecast: TEXT,
  impact_level: S,
  crop_affected: S,
});

const SoilHealth = sequelize.define('SoilHealth', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  farm_name: S,
  ph_level: F,
  nitrogen: F,
  phosphorus: F,
  potassium: F,
  organic_matter: F,
  moisture: F,
  health_score: F,
  field_id: S,
});

const CropRecommendation = sequelize.define('CropRecommendation', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  region: S,
  recommended_crop: S,
  expected_roi: F,
  growth_period: S,
  water_needs: S,
  soil_requirement: S,
  market_demand: S,
  risk_level: S,
  field_id: S,
});

const PestAlert = sequelize.define('PestAlert', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  pest_name: S,
  crop_affected: S,
  severity: S,
  location: S,
  detection_date: D,
  treatment: TEXT,
  spread_risk: S,
  status: S,
  image_url: S,
  ai_diagnosis: TEXT,
});

const IrrigationPlan = sequelize.define('IrrigationPlan', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  farm_name: S,
  crop_type: S,
  water_requirement: F,
  schedule: TEXT,
  efficiency_score: F,
  method: S,
  cost_estimate: F,
  season: S,
  field_id: S,
});

const HarvestPlan = sequelize.define('HarvestPlan', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  farm_name: S,
  crop_type: S,
  optimal_date: D,
  expected_quantity: F,
  quality_grade: S,
  market_window: S,
  storage_needed: F,
  priority: S,
});

const MarketTrend = sequelize.define('MarketTrend', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  commodity: S,
  trend_direction: S,
  price_change: F,
  volume_change: F,
  period: S,
  market: S,
  forecast_accuracy: F,
  analysis: TEXT,
});

const SupplyChain = sequelize.define('SupplyChain', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  product: S,
  origin: S,
  destination: S,
  transit_time: S,
  cost: F,
  status: S,
  carrier: S,
  quantity: F,
});

const FinancialPlan = sequelize.define('FinancialPlan', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  farm_name: S,
  budget: F,
  revenue_forecast: F,
  expense_forecast: F,
  profit_margin: F,
  roi: F,
  risk_assessment: TEXT,
  period: S,
});

const SatelliteData = sequelize.define('SatelliteData', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  farm_name: S,
  ndvi_index: F,
  crop_health: S,
  area_coverage: F,
  capture_date: D,
  resolution: S,
  anomaly_detected: S,
  recommendations: TEXT,
});

const Equipment = sequelize.define('Equipment', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  name: S,
  type: S,
  status: S,
  last_maintenance: D,
  next_maintenance: D,
  cost_per_hour: F,
  utilization_rate: F,
  farm_assigned: S,
});

const LaborPlan = sequelize.define('LaborPlan', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  task_name: S,
  workers_needed: I,
  skill_level: S,
  duration: S,
  cost_estimate: F,
  season: S,
  priority: S,
  department: S,
});

const Sustainability = sequelize.define('Sustainability', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  farm_name: S,
  carbon_footprint: F,
  water_usage: F,
  biodiversity_score: F,
  renewable_energy: F,
  waste_reduction: F,
  certification: S,
  overall_score: F,
});

const AiResult = sequelize.define('AiResult', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  feature: { type: S, allowNull: false },
  entity_id: I,
  input_data: JSONB,
  output_data: JSONB,
  model_used: S,
  created_by: I,
}, { tableName: 'ai_results' });

const MarketPriceAlert = sequelize.define('MarketPriceAlert', {
  id: { type: I, autoIncrement: true, primaryKey: true },
  market_price_id: I,
  user_id: I,
  threshold_price: F,
  direction: { type: S, defaultValue: 'above' },
  triggered: { type: BOOL, defaultValue: false },
  triggered_at: D,
  message: TEXT,
}, { tableName: 'market_price_alerts' });

module.exports = {
  sequelize, Sequelize,
  YieldPrediction, MarketPrice, WeatherAnalysis, SoilHealth, CropRecommendation,
  PestAlert, IrrigationPlan, HarvestPlan, MarketTrend, SupplyChain,
  FinancialPlan, SatelliteData, Equipment, LaborPlan, Sustainability,
  AiResult, MarketPriceAlert,
};

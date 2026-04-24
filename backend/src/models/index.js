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

const YieldPrediction = sequelize.define('YieldPrediction', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  farm_name: S, crop_type: S, predicted_yield: S, confidence: S, season: S, acreage: S, soil_type: S, irrigation_type: S,
});

const MarketPrice = sequelize.define('MarketPrice', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  commodity: S, current_price: S, predicted_price: S, change_percent: S, market: S, supply_level: S, demand_level: S, unit: S,
});

const WeatherAnalysis = sequelize.define('WeatherAnalysis', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  location: S, temperature: S, humidity: S, rainfall: S, wind_speed: S, forecast: S, impact_level: S, crop_affected: S,
});

const SoilHealth = sequelize.define('SoilHealth', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  farm_name: S, ph_level: S, nitrogen: S, phosphorus: S, potassium: S, organic_matter: S, moisture: S, health_score: S,
});

const CropRecommendation = sequelize.define('CropRecommendation', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  region: S, recommended_crop: S, expected_roi: S, growth_period: S, water_needs: S, soil_requirement: S, market_demand: S, risk_level: S,
});

const PestAlert = sequelize.define('PestAlert', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  pest_name: S, crop_affected: S, severity: S, location: S, detection_date: S, treatment: S, spread_risk: S, status: S,
});

const IrrigationPlan = sequelize.define('IrrigationPlan', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  farm_name: S, crop_type: S, water_requirement: S, schedule: S, efficiency_score: S, method: S, cost_estimate: S, season: S,
});

const HarvestPlan = sequelize.define('HarvestPlan', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  farm_name: S, crop_type: S, optimal_date: S, expected_quantity: S, quality_grade: S, market_window: S, storage_needed: S, priority: S,
});

const MarketTrend = sequelize.define('MarketTrend', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  commodity: S, trend_direction: S, price_change: S, volume_change: S, period: S, market: S, forecast_accuracy: S, analysis: S,
});

const SupplyChain = sequelize.define('SupplyChain', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  product: S, origin: S, destination: S, transit_time: S, cost: S, status: S, carrier: S, quantity: S,
});

const FinancialPlan = sequelize.define('FinancialPlan', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  farm_name: S, budget: S, revenue_forecast: S, expense_forecast: S, profit_margin: S, roi: S, risk_assessment: S, period: S,
});

const SatelliteData = sequelize.define('SatelliteData', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  farm_name: S, ndvi_index: S, crop_health: S, area_coverage: S, capture_date: S, resolution: S, anomaly_detected: S, recommendations: S,
});

const Equipment = sequelize.define('Equipment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: S, type: S, status: S, last_maintenance: S, next_maintenance: S, cost_per_hour: S, utilization_rate: S, farm_assigned: S,
});

const LaborPlan = sequelize.define('LaborPlan', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  task_name: S, workers_needed: S, skill_level: S, duration: S, cost_estimate: S, season: S, priority: S, department: S,
});

const Sustainability = sequelize.define('Sustainability', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  farm_name: S, carbon_footprint: S, water_usage: S, biodiversity_score: S, renewable_energy: S, waste_reduction: S, certification: S, overall_score: S,
});

module.exports = {
  sequelize, Sequelize,
  YieldPrediction, MarketPrice, WeatherAnalysis, SoilHealth, CropRecommendation,
  PestAlert, IrrigationPlan, HarvestPlan, MarketTrend, SupplyChain,
  FinancialPlan, SatelliteData, Equipment, LaborPlan, Sustainability,
};

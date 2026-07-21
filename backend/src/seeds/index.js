require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, YieldPrediction, MarketPrice, WeatherAnalysis, SoilHealth, CropRecommendation, PestAlert, IrrigationPlan, HarvestPlan, MarketTrend, SupplyChain, FinancialPlan, SatelliteData, Equipment, LaborPlan, Sustainability, AuthUser } = require('../models');

if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEMO_SEED !== 'true') {
  throw new Error('Demo seed is disabled; set ALLOW_DEMO_SEED=true only for an isolated non-production database.');
}

const seedData = {
  YieldPrediction: [
    { farm_name: 'Green Valley Farm', crop_type: 'Corn', predicted_yield: '185.5', confidence: '92.3', season: 'Spring 2024', acreage: '500', soil_type: 'Loam', irrigation_type: 'Center Pivot' },
    { farm_name: 'Sunrise Acres', crop_type: 'Wheat', predicted_yield: '62.8', confidence: '88.1', season: 'Winter 2024', acreage: '1200', soil_type: 'Clay Loam', irrigation_type: 'Drip' },
    { farm_name: 'Prairie Wind Ranch', crop_type: 'Soybeans', predicted_yield: '52.3', confidence: '90.5', season: 'Summer 2024', acreage: '800', soil_type: 'Sandy Loam', irrigation_type: 'Sprinkler' },
    { farm_name: 'Golden Harvest Fields', crop_type: 'Rice', predicted_yield: '7800', confidence: '85.7', season: 'Spring 2024', acreage: '350', soil_type: 'Clay', irrigation_type: 'Flood' },
    { farm_name: 'Blue Ridge Plantation', crop_type: 'Cotton', predicted_yield: '1150', confidence: '87.2', season: 'Summer 2024', acreage: '650', soil_type: 'Sandy', irrigation_type: 'Drip' },
    { farm_name: 'Heartland Growers', crop_type: 'Barley', predicted_yield: '78.4', confidence: '91.0', season: 'Spring 2024', acreage: '420', soil_type: 'Silt Loam', irrigation_type: 'Center Pivot' },
    { farm_name: 'Cedar Creek Farm', crop_type: 'Sorghum', predicted_yield: '95.2', confidence: '86.8', season: 'Summer 2024', acreage: '300', soil_type: 'Loam', irrigation_type: 'Furrow' },
    { farm_name: 'Willow Brook Estate', crop_type: 'Alfalfa', predicted_yield: '8.5', confidence: '93.1', season: 'Spring 2024', acreage: '250', soil_type: 'Loam', irrigation_type: 'Sprinkler' },
    { farm_name: 'Thunder Plains Co-op', crop_type: 'Corn', predicted_yield: '195.0', confidence: '89.4', season: 'Summer 2024', acreage: '1500', soil_type: 'Black Soil', irrigation_type: 'Center Pivot' },
    { farm_name: 'Maple Ridge Organics', crop_type: 'Oats', predicted_yield: '85.6', confidence: '84.3', season: 'Spring 2024', acreage: '180', soil_type: 'Sandy Loam', irrigation_type: 'Rainfed' },
    { farm_name: 'Riverside Meadows', crop_type: 'Sunflower', predicted_yield: '1850', confidence: '88.9', season: 'Summer 2024', acreage: '400', soil_type: 'Loam', irrigation_type: 'Drip' },
    { farm_name: 'Eagle Point Farm', crop_type: 'Canola', predicted_yield: '42.1', confidence: '86.5', season: 'Spring 2024', acreage: '600', soil_type: 'Clay Loam', irrigation_type: 'Sprinkler' },
    { farm_name: 'Silver Lake Agricultural', crop_type: 'Potatoes', predicted_yield: '385.0', confidence: '91.7', season: 'Summer 2024', acreage: '220', soil_type: 'Sandy Loam', irrigation_type: 'Drip' },
    { farm_name: 'Dusty Trails Ranch', crop_type: 'Wheat', predicted_yield: '58.3', confidence: '87.6', season: 'Winter 2024', acreage: '950', soil_type: 'Silt', irrigation_type: 'Center Pivot' },
    { farm_name: 'Morning Dew Farms', crop_type: 'Soybeans', predicted_yield: '48.7', confidence: '90.2', season: 'Summer 2024', acreage: '700', soil_type: 'Loam', irrigation_type: 'Sprinkler' }
  ],
  MarketPrice: [
    { commodity: 'Corn', current_price: '4.85', predicted_price: '5.12', change_percent: '5.57', market: 'CBOT', supply_level: 'Medium', demand_level: 'High', unit: 'bushel' },
    { commodity: 'Wheat', current_price: '6.42', predicted_price: '6.78', change_percent: '5.61', market: 'CBOT', supply_level: 'Low', demand_level: 'High', unit: 'bushel' },
    { commodity: 'Soybeans', current_price: '12.35', predicted_price: '12.90', change_percent: '4.45', market: 'CBOT', supply_level: 'Medium', demand_level: 'High', unit: 'bushel' },
    { commodity: 'Rice', current_price: '17.20', predicted_price: '17.85', change_percent: '3.78', market: 'CBOT', supply_level: 'Medium', demand_level: 'Medium', unit: 'cwt' },
    { commodity: 'Cotton', current_price: '0.82', predicted_price: '0.88', change_percent: '7.32', market: 'ICE', supply_level: 'Low', demand_level: 'High', unit: 'pound' },
    { commodity: 'Coffee Arabica', current_price: '185.50', predicted_price: '192.30', change_percent: '3.67', market: 'ICE', supply_level: 'Low', demand_level: 'High', unit: 'pound' },
    { commodity: 'Sugar #11', current_price: '0.245', predicted_price: '0.258', change_percent: '5.31', market: 'ICE', supply_level: 'Medium', demand_level: 'High', unit: 'pound' },
    { commodity: 'Cocoa', current_price: '3250', predicted_price: '3380', change_percent: '4.00', market: 'ICE', supply_level: 'Low', demand_level: 'High', unit: 'metric ton' },
    { commodity: 'Oats', current_price: '3.95', predicted_price: '4.15', change_percent: '5.06', market: 'CBOT', supply_level: 'Medium', demand_level: 'Medium', unit: 'bushel' },
    { commodity: 'Canola', current_price: '625.00', predicted_price: '648.50', change_percent: '3.76', market: 'ICE Canada', supply_level: 'Medium', demand_level: 'Medium', unit: 'metric ton' },
    { commodity: 'Soybean Oil', current_price: '0.485', predicted_price: '0.512', change_percent: '5.57', market: 'CBOT', supply_level: 'Medium', demand_level: 'High', unit: 'pound' },
    { commodity: 'Soybean Meal', current_price: '345.20', predicted_price: '358.00', change_percent: '3.71', market: 'CBOT', supply_level: 'High', demand_level: 'Medium', unit: 'short ton' },
    { commodity: 'Live Cattle', current_price: '178.50', predicted_price: '182.30', change_percent: '2.13', market: 'CME', supply_level: 'Low', demand_level: 'High', unit: 'cwt' },
    { commodity: 'Lean Hogs', current_price: '82.40', predicted_price: '86.10', change_percent: '4.49', market: 'CME', supply_level: 'Medium', demand_level: 'Medium', unit: 'cwt' },
    { commodity: 'Orange Juice', current_price: '3.85', predicted_price: '4.10', change_percent: '6.49', market: 'ICE', supply_level: 'Low', demand_level: 'High', unit: 'pound' }
  ],
  WeatherAnalysis: [
    { location: 'Des Moines, Iowa', temperature: '78', humidity: '65', rainfall: '3.2', wind_speed: '12', forecast: 'Partly Cloudy with afternoon showers', impact_level: 'Medium', crop_affected: 'Corn' },
    { location: 'Topeka, Kansas', temperature: '85', humidity: '45', rainfall: '0.5', wind_speed: '18', forecast: 'Hot and dry conditions expected', impact_level: 'High', crop_affected: 'Wheat' },
    { location: 'Springfield, Illinois', temperature: '72', humidity: '70', rainfall: '4.1', wind_speed: '8', forecast: 'Steady rain throughout the week', impact_level: 'Medium', crop_affected: 'Soybeans' },
    { location: 'Sacramento, California', temperature: '95', humidity: '25', rainfall: '0.0', wind_speed: '5', forecast: 'Extreme heat advisory', impact_level: 'Critical', crop_affected: 'Rice' },
    { location: 'Lubbock, Texas', temperature: '92', humidity: '30', rainfall: '0.2', wind_speed: '22', forecast: 'Drought conditions persisting', impact_level: 'Critical', crop_affected: 'Cotton' },
    { location: 'Fargo, North Dakota', temperature: '68', humidity: '55', rainfall: '1.8', wind_speed: '15', forecast: 'Mild with scattered showers', impact_level: 'Low', crop_affected: 'Barley' },
    { location: 'Lincoln, Nebraska', temperature: '80', humidity: '58', rainfall: '2.5', wind_speed: '10', forecast: 'Warm with occasional thunderstorms', impact_level: 'Medium', crop_affected: 'Corn' },
    { location: 'Fresno, California', temperature: '98', humidity: '20', rainfall: '0.0', wind_speed: '7', forecast: 'Excessive heat warning', impact_level: 'Critical', crop_affected: 'Almonds' },
    { location: 'Minneapolis, Minnesota', temperature: '65', humidity: '72', rainfall: '3.8', wind_speed: '14', forecast: 'Cool with heavy rain expected', impact_level: 'High', crop_affected: 'Soybeans' },
    { location: 'Baton Rouge, Louisiana', temperature: '88', humidity: '82', rainfall: '5.5', wind_speed: '20', forecast: 'Tropical storm warning', impact_level: 'Critical', crop_affected: 'Sugarcane' },
    { location: 'Sioux Falls, South Dakota', temperature: '70', humidity: '50', rainfall: '1.2', wind_speed: '16', forecast: 'Clear skies with gusty winds', impact_level: 'Low', crop_affected: 'Sunflower' },
    { location: 'Columbia, Missouri', temperature: '76', humidity: '62', rainfall: '2.8', wind_speed: '9', forecast: 'Moderate rainfall beneficial for crops', impact_level: 'Low', crop_affected: 'Soybeans' },
    { location: 'Raleigh, North Carolina', temperature: '82', humidity: '75', rainfall: '4.5', wind_speed: '11', forecast: 'Humid with thunderstorm risk', impact_level: 'Medium', crop_affected: 'Tobacco' },
    { location: 'Phoenix, Arizona', temperature: '105', humidity: '15', rainfall: '0.0', wind_speed: '8', forecast: 'Extreme heat continues', impact_level: 'Critical', crop_affected: 'Citrus' },
    { location: 'Omaha, Nebraska', temperature: '74', humidity: '60', rainfall: '2.0', wind_speed: '13', forecast: 'Ideal growing conditions', impact_level: 'Low', crop_affected: 'Corn' }
  ],
  SoilHealth: [
    { farm_name: 'Green Valley Farm', ph_level: '6.5', nitrogen: '45 ppm', phosphorus: '32 ppm', potassium: '180 ppm', organic_matter: '3.8%', moisture: '28%', health_score: '85' },
    { farm_name: 'Sunrise Acres', ph_level: '7.1', nitrogen: '38 ppm', phosphorus: '28 ppm', potassium: '165 ppm', organic_matter: '3.2%', moisture: '24%', health_score: '78' },
    { farm_name: 'Prairie Wind Ranch', ph_level: '6.8', nitrogen: '52 ppm', phosphorus: '35 ppm', potassium: '195 ppm', organic_matter: '4.1%', moisture: '31%', health_score: '90' },
    { farm_name: 'Golden Harvest Fields', ph_level: '5.9', nitrogen: '60 ppm', phosphorus: '40 ppm', potassium: '210 ppm', organic_matter: '4.5%', moisture: '45%', health_score: '88' },
    { farm_name: 'Blue Ridge Plantation', ph_level: '6.2', nitrogen: '35 ppm', phosphorus: '22 ppm', potassium: '140 ppm', organic_matter: '2.8%', moisture: '18%', health_score: '65' },
    { farm_name: 'Heartland Growers', ph_level: '6.9', nitrogen: '48 ppm', phosphorus: '30 ppm', potassium: '175 ppm', organic_matter: '3.6%', moisture: '26%', health_score: '82' },
    { farm_name: 'Cedar Creek Farm', ph_level: '7.3', nitrogen: '32 ppm', phosphorus: '25 ppm', potassium: '155 ppm', organic_matter: '2.5%', moisture: '20%', health_score: '70' },
    { farm_name: 'Willow Brook Estate', ph_level: '6.6', nitrogen: '55 ppm', phosphorus: '38 ppm', potassium: '200 ppm', organic_matter: '4.3%', moisture: '33%', health_score: '92' },
    { farm_name: 'Thunder Plains Co-op', ph_level: '6.4', nitrogen: '42 ppm', phosphorus: '29 ppm', potassium: '170 ppm', organic_matter: '3.5%', moisture: '27%', health_score: '80' },
    { farm_name: 'Maple Ridge Organics', ph_level: '6.7', nitrogen: '58 ppm', phosphorus: '42 ppm', potassium: '220 ppm', organic_matter: '5.2%', moisture: '35%', health_score: '95' },
    { farm_name: 'Riverside Meadows', ph_level: '7.0', nitrogen: '40 ppm', phosphorus: '27 ppm', potassium: '160 ppm', organic_matter: '3.0%', moisture: '22%', health_score: '75' },
    { farm_name: 'Eagle Point Farm', ph_level: '6.3', nitrogen: '50 ppm', phosphorus: '34 ppm', potassium: '185 ppm', organic_matter: '3.9%', moisture: '29%', health_score: '86' },
    { farm_name: 'Silver Lake Agricultural', ph_level: '5.8', nitrogen: '44 ppm', phosphorus: '31 ppm', potassium: '175 ppm', organic_matter: '3.4%', moisture: '32%', health_score: '79' },
    { farm_name: 'Dusty Trails Ranch', ph_level: '7.5', nitrogen: '28 ppm', phosphorus: '18 ppm', potassium: '130 ppm', organic_matter: '2.1%', moisture: '15%', health_score: '58' },
    { farm_name: 'Morning Dew Farms', ph_level: '6.5', nitrogen: '47 ppm', phosphorus: '33 ppm', potassium: '190 ppm', organic_matter: '3.7%', moisture: '30%', health_score: '84' }
  ],
  CropRecommendation: [
    { region: 'Iowa Corn Belt', recommended_crop: 'Corn', expected_roi: '22%', growth_period: '120 days', water_needs: 'Medium', soil_requirement: 'Loam', market_demand: 'High', risk_level: 'Low' },
    { region: 'Kansas Wheat Belt', recommended_crop: 'Winter Wheat', expected_roi: '18%', growth_period: '180 days', water_needs: 'Low', soil_requirement: 'Clay Loam', market_demand: 'High', risk_level: 'Low' },
    { region: 'Mississippi Delta', recommended_crop: 'Rice', expected_roi: '20%', growth_period: '150 days', water_needs: 'Very High', soil_requirement: 'Clay', market_demand: 'Medium', risk_level: 'Medium' },
    { region: 'Texas High Plains', recommended_crop: 'Cotton', expected_roi: '25%', growth_period: '160 days', water_needs: 'Medium', soil_requirement: 'Sandy Loam', market_demand: 'High', risk_level: 'Medium' },
    { region: 'Minnesota Prairies', recommended_crop: 'Soybeans', expected_roi: '19%', growth_period: '110 days', water_needs: 'Medium', soil_requirement: 'Silt Loam', market_demand: 'High', risk_level: 'Low' },
    { region: 'Central California Valley', recommended_crop: 'Almonds', expected_roi: '30%', growth_period: 'Perennial', water_needs: 'High', soil_requirement: 'Sandy Loam', market_demand: 'Very High', risk_level: 'High' },
    { region: 'Pacific Northwest', recommended_crop: 'Hops', expected_roi: '35%', growth_period: '120 days', water_needs: 'Medium', soil_requirement: 'Loam', market_demand: 'High', risk_level: 'Medium' },
    { region: 'Florida Peninsula', recommended_crop: 'Citrus', expected_roi: '24%', growth_period: 'Perennial', water_needs: 'High', soil_requirement: 'Sandy', market_demand: 'High', risk_level: 'High' },
    { region: 'North Dakota Plains', recommended_crop: 'Canola', expected_roi: '17%', growth_period: '100 days', water_needs: 'Low', soil_requirement: 'Loam', market_demand: 'Medium', risk_level: 'Low' },
    { region: 'Idaho Highlands', recommended_crop: 'Potatoes', expected_roi: '21%', growth_period: '90 days', water_needs: 'Medium', soil_requirement: 'Sandy Loam', market_demand: 'High', risk_level: 'Low' },
    { region: 'Georgia Piedmont', recommended_crop: 'Peanuts', expected_roi: '23%', growth_period: '140 days', water_needs: 'Medium', soil_requirement: 'Sandy', market_demand: 'Medium', risk_level: 'Low' },
    { region: 'Wisconsin Dairyland', recommended_crop: 'Alfalfa', expected_roi: '16%', growth_period: 'Perennial', water_needs: 'Medium', soil_requirement: 'Loam', market_demand: 'Medium', risk_level: 'Low' },
    { region: 'South Carolina Lowcountry', recommended_crop: 'Sweet Potatoes', expected_roi: '26%', growth_period: '100 days', water_needs: 'Medium', soil_requirement: 'Sandy Loam', market_demand: 'High', risk_level: 'Low' },
    { region: 'Nebraska Sandhills', recommended_crop: 'Sorghum', expected_roi: '15%', growth_period: '100 days', water_needs: 'Low', soil_requirement: 'Sandy', market_demand: 'Medium', risk_level: 'Low' },
    { region: 'Napa Valley', recommended_crop: 'Wine Grapes', expected_roi: '40%', growth_period: 'Perennial', water_needs: 'Medium', soil_requirement: 'Rocky Loam', market_demand: 'Very High', risk_level: 'High' }
  ],
  PestAlert: [
    { pest_name: 'European Corn Borer', crop_affected: 'Corn', severity: 'High', location: 'Iowa', detection_date: '2024-06-15', treatment: 'Bt corn hybrids, Trichogramma release', spread_risk: 'High', status: 'Active' },
    { pest_name: 'Soybean Aphid', crop_affected: 'Soybeans', severity: 'Medium', location: 'Minnesota', detection_date: '2024-07-01', treatment: 'Imidacloprid application', spread_risk: 'Medium', status: 'Monitoring' },
    { pest_name: 'Fall Armyworm', crop_affected: 'Corn', severity: 'Critical', location: 'Texas', detection_date: '2024-05-20', treatment: 'Chlorantraniliprole spray', spread_risk: 'High', status: 'Active' },
    { pest_name: 'Hessian Fly', crop_affected: 'Wheat', severity: 'Medium', location: 'Kansas', detection_date: '2024-04-10', treatment: 'Resistant varieties, delayed planting', spread_risk: 'Low', status: 'Monitoring' },
    { pest_name: 'Boll Weevil', crop_affected: 'Cotton', severity: 'High', location: 'Mississippi', detection_date: '2024-06-25', treatment: 'Malathion ULV application', spread_risk: 'High', status: 'Active' },
    { pest_name: 'Rice Water Weevil', crop_affected: 'Rice', severity: 'Medium', location: 'Louisiana', detection_date: '2024-05-05', treatment: 'Seed treatment with clothianidin', spread_risk: 'Medium', status: 'Active' },
    { pest_name: 'Wheat Stem Rust', crop_affected: 'Wheat', severity: 'Critical', location: 'North Dakota', detection_date: '2024-06-30', treatment: 'Propiconazole fungicide', spread_risk: 'High', status: 'Active' },
    { pest_name: 'Japanese Beetle', crop_affected: 'Soybeans', severity: 'Low', location: 'Illinois', detection_date: '2024-07-10', treatment: 'Carbaryl application', spread_risk: 'Low', status: 'Monitoring' },
    { pest_name: 'Corn Rootworm', crop_affected: 'Corn', severity: 'High', location: 'Nebraska', detection_date: '2024-06-01', treatment: 'Crop rotation, soil insecticide', spread_risk: 'Medium', status: 'Active' },
    { pest_name: 'Cotton Bollworm', crop_affected: 'Cotton', severity: 'High', location: 'Georgia', detection_date: '2024-07-05', treatment: 'Spinosad spray', spread_risk: 'High', status: 'Active' },
    { pest_name: 'Potato Leafhopper', crop_affected: 'Alfalfa', severity: 'Medium', location: 'Wisconsin', detection_date: '2024-06-20', treatment: 'Lambda-cyhalothrin', spread_risk: 'Medium', status: 'Monitoring' },
    { pest_name: 'Grasshoppers', crop_affected: 'Multiple Crops', severity: 'High', location: 'South Dakota', detection_date: '2024-07-15', treatment: 'Diflubenzuron bait', spread_risk: 'High', status: 'Active' },
    { pest_name: 'Soybean Cyst Nematode', crop_affected: 'Soybeans', severity: 'Critical', location: 'Missouri', detection_date: '2024-04-25', treatment: 'Resistant cultivars, rotation', spread_risk: 'Low', status: 'Resolved' },
    { pest_name: 'Spotted Wing Drosophila', crop_affected: 'Berries', severity: 'Medium', location: 'Oregon', detection_date: '2024-06-10', treatment: 'Spinosad, exclusion netting', spread_risk: 'Medium', status: 'Active' },
    { pest_name: 'Sugarcane Borer', crop_affected: 'Sugarcane', severity: 'High', location: 'Florida', detection_date: '2024-05-30', treatment: 'Trichogramma parasitoid release', spread_risk: 'Medium', status: 'Monitoring' }
  ],
  IrrigationPlan: [
    { farm_name: 'Green Valley Farm', crop_type: 'Corn', water_requirement: '24 inches/season', schedule: 'Every 3 days', efficiency_score: '88', method: 'Center Pivot', cost_estimate: '$4,500', season: 'Summer 2024' },
    { farm_name: 'Sunrise Acres', crop_type: 'Wheat', water_requirement: '15 inches/season', schedule: 'Every 5 days', efficiency_score: '92', method: 'Drip Irrigation', cost_estimate: '$3,200', season: 'Spring 2024' },
    { farm_name: 'Prairie Wind Ranch', crop_type: 'Soybeans', water_requirement: '20 inches/season', schedule: 'Every 4 days', efficiency_score: '85', method: 'Sprinkler', cost_estimate: '$3,800', season: 'Summer 2024' },
    { farm_name: 'Golden Harvest Fields', crop_type: 'Rice', water_requirement: '48 inches/season', schedule: 'Continuous flood', efficiency_score: '65', method: 'Flood', cost_estimate: '$8,200', season: 'Spring 2024' },
    { farm_name: 'Blue Ridge Plantation', crop_type: 'Cotton', water_requirement: '22 inches/season', schedule: 'Every 3 days', efficiency_score: '90', method: 'Subsurface Drip', cost_estimate: '$5,100', season: 'Summer 2024' },
    { farm_name: 'Heartland Growers', crop_type: 'Barley', water_requirement: '14 inches/season', schedule: 'Every 6 days', efficiency_score: '87', method: 'Center Pivot', cost_estimate: '$2,800', season: 'Spring 2024' },
    { farm_name: 'Cedar Creek Farm', crop_type: 'Sorghum', water_requirement: '18 inches/season', schedule: 'Every 5 days', efficiency_score: '83', method: 'Furrow', cost_estimate: '$2,400', season: 'Summer 2024' },
    { farm_name: 'Willow Brook Estate', crop_type: 'Alfalfa', water_requirement: '36 inches/season', schedule: 'Every 3 days', efficiency_score: '91', method: 'Sprinkler', cost_estimate: '$6,500', season: 'Year-round' },
    { farm_name: 'Thunder Plains Co-op', crop_type: 'Corn', water_requirement: '26 inches/season', schedule: 'Every 2 days', efficiency_score: '86', method: 'Center Pivot', cost_estimate: '$7,200', season: 'Summer 2024' },
    { farm_name: 'Maple Ridge Organics', crop_type: 'Vegetables', water_requirement: '30 inches/season', schedule: 'Daily', efficiency_score: '94', method: 'Drip Irrigation', cost_estimate: '$4,800', season: 'Spring-Fall 2024' },
    { farm_name: 'Riverside Meadows', crop_type: 'Sunflower', water_requirement: '16 inches/season', schedule: 'Every 5 days', efficiency_score: '82', method: 'Sprinkler', cost_estimate: '$2,600', season: 'Summer 2024' },
    { farm_name: 'Eagle Point Farm', crop_type: 'Canola', water_requirement: '14 inches/season', schedule: 'Every 7 days', efficiency_score: '80', method: 'Center Pivot', cost_estimate: '$2,200', season: 'Spring 2024' },
    { farm_name: 'Silver Lake Agricultural', crop_type: 'Potatoes', water_requirement: '25 inches/season', schedule: 'Every 2 days', efficiency_score: '93', method: 'Drip Irrigation', cost_estimate: '$5,500', season: 'Summer 2024' },
    { farm_name: 'Dusty Trails Ranch', crop_type: 'Wheat', water_requirement: '12 inches/season', schedule: 'Every 7 days', efficiency_score: '78', method: 'Center Pivot', cost_estimate: '$2,000', season: 'Winter 2024' },
    { farm_name: 'Morning Dew Farms', crop_type: 'Soybeans', water_requirement: '19 inches/season', schedule: 'Every 4 days', efficiency_score: '89', method: 'Sprinkler', cost_estimate: '$3,600', season: 'Summer 2024' }
  ],
  HarvestPlan: [
    { farm_name: 'Green Valley Farm', crop_type: 'Corn', optimal_date: '2024-10-15', expected_quantity: '92,500 bushels', quality_grade: 'Premium', market_window: 'Oct 10-25', storage_needed: 'Yes - 100,000 bu capacity', priority: 'High' },
    { farm_name: 'Sunrise Acres', crop_type: 'Wheat', optimal_date: '2024-07-20', expected_quantity: '75,360 bushels', quality_grade: 'A', market_window: 'Jul 15-Aug 5', storage_needed: 'Yes - 80,000 bu capacity', priority: 'High' },
    { farm_name: 'Prairie Wind Ranch', crop_type: 'Soybeans', optimal_date: '2024-10-05', expected_quantity: '41,840 bushels', quality_grade: 'A', market_window: 'Oct 1-20', storage_needed: 'No - direct sale', priority: 'Medium' },
    { farm_name: 'Golden Harvest Fields', crop_type: 'Rice', optimal_date: '2024-09-25', expected_quantity: '2,730,000 lbs', quality_grade: 'Premium', market_window: 'Sep 20-Oct 10', storage_needed: 'Yes - climate controlled', priority: 'High' },
    { farm_name: 'Blue Ridge Plantation', crop_type: 'Cotton', optimal_date: '2024-10-20', expected_quantity: '747,500 lbs', quality_grade: 'B+', market_window: 'Oct 15-Nov 5', storage_needed: 'Yes - warehouse', priority: 'Medium' },
    { farm_name: 'Heartland Growers', crop_type: 'Barley', optimal_date: '2024-07-10', expected_quantity: '32,928 bushels', quality_grade: 'A', market_window: 'Jul 5-25', storage_needed: 'Yes - 40,000 bu capacity', priority: 'Medium' },
    { farm_name: 'Cedar Creek Farm', crop_type: 'Sorghum', optimal_date: '2024-10-10', expected_quantity: '28,560 bushels', quality_grade: 'B', market_window: 'Oct 5-25', storage_needed: 'No - contract delivery', priority: 'Low' },
    { farm_name: 'Willow Brook Estate', crop_type: 'Alfalfa', optimal_date: '2024-06-15', expected_quantity: '2,125 tons', quality_grade: 'Premium', market_window: 'Jun-Oct rolling', storage_needed: 'Yes - hay barn', priority: 'High' },
    { farm_name: 'Thunder Plains Co-op', crop_type: 'Corn', optimal_date: '2024-10-20', expected_quantity: '292,500 bushels', quality_grade: 'A', market_window: 'Oct 15-Nov 1', storage_needed: 'Yes - 300,000 bu facility', priority: 'High' },
    { farm_name: 'Maple Ridge Organics', crop_type: 'Oats', optimal_date: '2024-08-01', expected_quantity: '15,408 bushels', quality_grade: 'Organic Premium', market_window: 'Aug 1-20', storage_needed: 'Yes - certified organic', priority: 'Medium' },
    { farm_name: 'Riverside Meadows', crop_type: 'Sunflower', optimal_date: '2024-09-15', expected_quantity: '740,000 lbs', quality_grade: 'A', market_window: 'Sep 10-30', storage_needed: 'Yes - oil processing', priority: 'Medium' },
    { farm_name: 'Eagle Point Farm', crop_type: 'Canola', optimal_date: '2024-07-25', expected_quantity: '25,260 bushels', quality_grade: 'B+', market_window: 'Jul 20-Aug 10', storage_needed: 'No - direct sale', priority: 'Low' },
    { farm_name: 'Silver Lake Agricultural', crop_type: 'Potatoes', optimal_date: '2024-09-10', expected_quantity: '84,700 cwt', quality_grade: 'Premium', market_window: 'Sep 1-Oct 15', storage_needed: 'Yes - cold storage', priority: 'High' },
    { farm_name: 'Dusty Trails Ranch', crop_type: 'Wheat', optimal_date: '2024-07-15', expected_quantity: '55,385 bushels', quality_grade: 'B', market_window: 'Jul 10-30', storage_needed: 'Yes - 60,000 bu capacity', priority: 'Medium' },
    { farm_name: 'Morning Dew Farms', crop_type: 'Soybeans', optimal_date: '2024-10-08', expected_quantity: '34,090 bushels', quality_grade: 'A', market_window: 'Oct 5-20', storage_needed: 'No - cooperative delivery', priority: 'Medium' }
  ],
  MarketTrend: [
    { commodity: 'Corn', trend_direction: 'Bullish', price_change: '+8.2%', volume_change: '+12.5%', period: 'Q3 2024', market: 'CBOT', forecast_accuracy: '91%', analysis: 'Strong ethanol demand driving prices up' },
    { commodity: 'Wheat', trend_direction: 'Bullish', price_change: '+12.1%', volume_change: '+18.3%', period: 'Q3 2024', market: 'CBOT', forecast_accuracy: '88%', analysis: 'Global supply concerns due to Black Sea disruptions' },
    { commodity: 'Soybeans', trend_direction: 'Neutral', price_change: '+2.3%', volume_change: '+5.1%', period: 'Q3 2024', market: 'CBOT', forecast_accuracy: '85%', analysis: 'Balanced supply-demand with China imports steady' },
    { commodity: 'Rice', trend_direction: 'Bullish', price_change: '+15.4%', volume_change: '+22.0%', period: 'Q3 2024', market: 'CBOT', forecast_accuracy: '82%', analysis: 'Export restrictions from major producers' },
    { commodity: 'Cotton', trend_direction: 'Bearish', price_change: '-4.5%', volume_change: '-8.2%', period: 'Q3 2024', market: 'ICE', forecast_accuracy: '79%', analysis: 'Oversupply from increased planting acreage' },
    { commodity: 'Coffee', trend_direction: 'Bullish', price_change: '+20.3%', volume_change: '+15.7%', period: 'Q3 2024', market: 'ICE', forecast_accuracy: '86%', analysis: 'Brazilian drought impacting Arabica production' },
    { commodity: 'Sugar', trend_direction: 'Neutral', price_change: '+1.8%', volume_change: '+3.2%', period: 'Q3 2024', market: 'ICE', forecast_accuracy: '83%', analysis: 'Indian production stabilizing market' },
    { commodity: 'Cocoa', trend_direction: 'Bullish', price_change: '+35.2%', volume_change: '+28.4%', period: 'Q3 2024', market: 'ICE', forecast_accuracy: '90%', analysis: 'West African crop disease causing severe shortage' },
    { commodity: 'Soybean Oil', trend_direction: 'Bullish', price_change: '+9.7%', volume_change: '+11.2%', period: 'Q3 2024', market: 'CBOT', forecast_accuracy: '84%', analysis: 'Renewable diesel demand increasing' },
    { commodity: 'Live Cattle', trend_direction: 'Bullish', price_change: '+6.8%', volume_change: '+4.5%', period: 'Q3 2024', market: 'CME', forecast_accuracy: '87%', analysis: 'Tight supply with strong consumer demand' },
    { commodity: 'Lean Hogs', trend_direction: 'Bearish', price_change: '-3.2%', volume_change: '-6.8%', period: 'Q3 2024', market: 'CME', forecast_accuracy: '81%', analysis: 'Seasonal production increase pressuring prices' },
    { commodity: 'Oats', trend_direction: 'Neutral', price_change: '+0.5%', volume_change: '+2.1%', period: 'Q3 2024', market: 'CBOT', forecast_accuracy: '78%', analysis: 'Stable demand with adequate Canadian supply' },
    { commodity: 'Canola', trend_direction: 'Bearish', price_change: '-5.8%', volume_change: '-9.3%', period: 'Q3 2024', market: 'ICE Canada', forecast_accuracy: '80%', analysis: 'Record harvest expected in Canadian prairies' },
    { commodity: 'Orange Juice', trend_direction: 'Bullish', price_change: '+28.6%', volume_change: '+19.8%', period: 'Q3 2024', market: 'ICE', forecast_accuracy: '92%', analysis: 'Citrus greening disease devastating Florida crops' },
    { commodity: 'Palm Oil', trend_direction: 'Neutral', price_change: '+3.1%', volume_change: '+7.4%', period: 'Q3 2024', market: 'Bursa Malaysia', forecast_accuracy: '76%', analysis: 'Indonesian export policy changes creating uncertainty' }
  ],
  SupplyChain: [
    { product: 'Corn (Grade #2)', origin: 'Des Moines, IA', destination: 'Chicago, IL', transit_time: '2 days', cost: '$4,200', status: 'In Transit', carrier: 'Union Pacific Rail', quantity: '50,000 bushels' },
    { product: 'Hard Red Wheat', origin: 'Topeka, KS', destination: 'Kansas City, MO', transit_time: '1 day', cost: '$2,800', status: 'Delivered', carrier: 'BNSF Railway', quantity: '35,000 bushels' },
    { product: 'Soybeans', origin: 'Springfield, IL', destination: 'New Orleans, LA', transit_time: '5 days', cost: '$8,500', status: 'In Transit', carrier: 'Barge - Mississippi River', quantity: '75,000 bushels' },
    { product: 'Long Grain Rice', origin: 'Stuttgart, AR', destination: 'Houston, TX', transit_time: '3 days', cost: '$5,100', status: 'Pending', carrier: 'Schneider Trucking', quantity: '500,000 lbs' },
    { product: 'Raw Cotton Bales', origin: 'Lubbock, TX', destination: 'Savannah, GA', transit_time: '4 days', cost: '$7,200', status: 'In Transit', carrier: 'CSX Transportation', quantity: '200 bales' },
    { product: 'Malting Barley', origin: 'Great Falls, MT', destination: 'Milwaukee, WI', transit_time: '3 days', cost: '$5,800', status: 'Delivered', carrier: 'BNSF Railway', quantity: '25,000 bushels' },
    { product: 'Grain Sorghum', origin: 'Amarillo, TX', destination: 'Corpus Christi, TX', transit_time: '2 days', cost: '$3,400', status: 'In Transit', carrier: 'Swift Transportation', quantity: '40,000 bushels' },
    { product: 'Alfalfa Hay', origin: 'Nampa, ID', destination: 'Sacramento, CA', transit_time: '2 days', cost: '$4,600', status: 'Delayed', carrier: 'Werner Enterprises', quantity: '500 tons' },
    { product: 'Seed Corn', origin: 'Des Moines, IA', destination: 'Lincoln, NE', transit_time: '1 day', cost: '$3,100', status: 'Delivered', carrier: 'Heartland Express', quantity: '20,000 bags' },
    { product: 'Organic Oats', origin: 'Winnipeg, MB', destination: 'Minneapolis, MN', transit_time: '2 days', cost: '$3,800', status: 'In Transit', carrier: 'Canadian Pacific Rail', quantity: '15,000 bushels' },
    { product: 'Sunflower Seeds', origin: 'Bismarck, ND', destination: 'Fargo, ND', transit_time: '1 day', cost: '$1,900', status: 'Delivered', carrier: 'Local Fleet', quantity: '30,000 lbs' },
    { product: 'Canola Seed', origin: 'Minot, ND', destination: 'Portland, OR', transit_time: '4 days', cost: '$6,200', status: 'Pending', carrier: 'BNSF Railway', quantity: '20,000 bushels' },
    { product: 'Russet Potatoes', origin: 'Idaho Falls, ID', destination: 'Los Angeles, CA', transit_time: '3 days', cost: '$5,500', status: 'In Transit', carrier: 'CR England', quantity: '45,000 cwt' },
    { product: 'Fertilizer (NPK)', origin: 'Tampa, FL', destination: 'Memphis, TN', transit_time: '3 days', cost: '$6,800', status: 'Delayed', carrier: 'Barge - Intracoastal', quantity: '2,000 tons' },
    { product: 'Sugar Beets', origin: 'Moorhead, MN', destination: 'East Grand Forks, MN', transit_time: '1 day', cost: '$2,200', status: 'Delivered', carrier: 'American Crystal Sugar Fleet', quantity: '800 tons' }
  ],
  FinancialPlan: [
    { farm_name: 'Green Valley Farm', budget: '$850,000', revenue_forecast: '$1,250,000', expense_forecast: '$780,000', profit_margin: '37.6%', roi: '22.4%', risk_assessment: 'Low', period: 'FY 2024' },
    { farm_name: 'Sunrise Acres', budget: '$1,200,000', revenue_forecast: '$1,680,000', expense_forecast: '$1,100,000', profit_margin: '34.5%', roi: '18.9%', risk_assessment: 'Low', period: 'FY 2024' },
    { farm_name: 'Prairie Wind Ranch', budget: '$620,000', revenue_forecast: '$880,000', expense_forecast: '$590,000', profit_margin: '33.0%', roi: '20.1%', risk_assessment: 'Medium', period: 'FY 2024' },
    { farm_name: 'Golden Harvest Fields', budget: '$480,000', revenue_forecast: '$720,000', expense_forecast: '$465,000', profit_margin: '35.4%', roi: '24.5%', risk_assessment: 'Medium', period: 'FY 2024' },
    { farm_name: 'Blue Ridge Plantation', budget: '$750,000', revenue_forecast: '$1,050,000', expense_forecast: '$720,000', profit_margin: '31.4%', roi: '17.8%', risk_assessment: 'Medium', period: 'FY 2024' },
    { farm_name: 'Heartland Growers', budget: '$540,000', revenue_forecast: '$780,000', expense_forecast: '$510,000', profit_margin: '34.6%', roi: '21.2%', risk_assessment: 'Low', period: 'FY 2024' },
    { farm_name: 'Cedar Creek Farm', budget: '$380,000', revenue_forecast: '$520,000', expense_forecast: '$365,000', profit_margin: '29.8%', roi: '15.4%', risk_assessment: 'Medium', period: 'FY 2024' },
    { farm_name: 'Willow Brook Estate', budget: '$420,000', revenue_forecast: '$650,000', expense_forecast: '$395,000', profit_margin: '39.2%', roi: '26.8%', risk_assessment: 'Low', period: 'FY 2024' },
    { farm_name: 'Thunder Plains Co-op', budget: '$2,100,000', revenue_forecast: '$3,150,000', expense_forecast: '$2,050,000', profit_margin: '34.9%', roi: '19.5%', risk_assessment: 'Low', period: 'FY 2024' },
    { farm_name: 'Maple Ridge Organics', budget: '$320,000', revenue_forecast: '$520,000', expense_forecast: '$305,000', profit_margin: '41.3%', roi: '28.5%', risk_assessment: 'Medium', period: 'FY 2024' },
    { farm_name: 'Riverside Meadows', budget: '$580,000', revenue_forecast: '$810,000', expense_forecast: '$555,000', profit_margin: '31.5%', roi: '16.8%', risk_assessment: 'Medium', period: 'FY 2024' },
    { farm_name: 'Eagle Point Farm', budget: '$690,000', revenue_forecast: '$950,000', expense_forecast: '$660,000', profit_margin: '30.5%', roi: '18.2%', risk_assessment: 'Medium', period: 'FY 2024' },
    { farm_name: 'Silver Lake Agricultural', budget: '$410,000', revenue_forecast: '$640,000', expense_forecast: '$385,000', profit_margin: '39.8%', roi: '25.6%', risk_assessment: 'Low', period: 'FY 2024' },
    { farm_name: 'Dusty Trails Ranch', budget: '$920,000', revenue_forecast: '$1,180,000', expense_forecast: '$890,000', profit_margin: '24.6%', roi: '12.3%', risk_assessment: 'High', period: 'FY 2024' },
    { farm_name: 'Morning Dew Farms', budget: '$560,000', revenue_forecast: '$820,000', expense_forecast: '$535,000', profit_margin: '34.8%', roi: '21.0%', risk_assessment: 'Low', period: 'FY 2024' }
  ],
  SatelliteData: [
    { farm_name: 'Green Valley Farm', ndvi_index: '0.82', crop_health: 'Excellent', area_coverage: '500 acres', capture_date: '2024-07-15', resolution: '10m', anomaly_detected: 'No', recommendations: 'Maintain current practices' },
    { farm_name: 'Sunrise Acres', ndvi_index: '0.71', crop_health: 'Good', area_coverage: '1200 acres', capture_date: '2024-07-14', resolution: '10m', anomaly_detected: 'Yes', recommendations: 'Check northeast section for water stress' },
    { farm_name: 'Prairie Wind Ranch', ndvi_index: '0.76', crop_health: 'Good', area_coverage: '800 acres', capture_date: '2024-07-16', resolution: '10m', anomaly_detected: 'No', recommendations: 'Optimal growth trajectory' },
    { farm_name: 'Golden Harvest Fields', ndvi_index: '0.68', crop_health: 'Fair', area_coverage: '350 acres', capture_date: '2024-07-13', resolution: '5m', anomaly_detected: 'Yes', recommendations: 'Investigate brown patches in south field' },
    { farm_name: 'Blue Ridge Plantation', ndvi_index: '0.58', crop_health: 'Fair', area_coverage: '650 acres', capture_date: '2024-07-15', resolution: '10m', anomaly_detected: 'Yes', recommendations: 'Significant water stress detected' },
    { farm_name: 'Heartland Growers', ndvi_index: '0.79', crop_health: 'Good', area_coverage: '420 acres', capture_date: '2024-07-14', resolution: '10m', anomaly_detected: 'No', recommendations: 'Healthy canopy development' },
    { farm_name: 'Cedar Creek Farm', ndvi_index: '0.65', crop_health: 'Fair', area_coverage: '300 acres', capture_date: '2024-07-16', resolution: '10m', anomaly_detected: 'Yes', recommendations: 'Possible nutrient deficiency in west section' },
    { farm_name: 'Willow Brook Estate', ndvi_index: '0.85', crop_health: 'Excellent', area_coverage: '250 acres', capture_date: '2024-07-15', resolution: '5m', anomaly_detected: 'No', recommendations: 'Peak biomass achieved, schedule harvest' },
    { farm_name: 'Thunder Plains Co-op', ndvi_index: '0.74', crop_health: 'Good', area_coverage: '1500 acres', capture_date: '2024-07-13', resolution: '10m', anomaly_detected: 'No', recommendations: 'Uniform growth across all sections' },
    { farm_name: 'Maple Ridge Organics', ndvi_index: '0.88', crop_health: 'Excellent', area_coverage: '180 acres', capture_date: '2024-07-14', resolution: '5m', anomaly_detected: 'No', recommendations: 'Exceptional crop health' },
    { farm_name: 'Riverside Meadows', ndvi_index: '0.72', crop_health: 'Good', area_coverage: '400 acres', capture_date: '2024-07-16', resolution: '10m', anomaly_detected: 'No', recommendations: 'Normal development for growth stage' },
    { farm_name: 'Eagle Point Farm', ndvi_index: '0.69', crop_health: 'Fair', area_coverage: '600 acres', capture_date: '2024-07-15', resolution: '10m', anomaly_detected: 'Yes', recommendations: 'Wind damage in northern fields' },
    { farm_name: 'Silver Lake Agricultural', ndvi_index: '0.81', crop_health: 'Excellent', area_coverage: '220 acres', capture_date: '2024-07-14', resolution: '5m', anomaly_detected: 'No', recommendations: 'Tuber development on track' },
    { farm_name: 'Dusty Trails Ranch', ndvi_index: '0.45', crop_health: 'Poor', area_coverage: '950 acres', capture_date: '2024-07-13', resolution: '10m', anomaly_detected: 'Yes', recommendations: 'Severe drought stress - emergency irrigation needed' },
    { farm_name: 'Morning Dew Farms', ndvi_index: '0.77', crop_health: 'Good', area_coverage: '700 acres', capture_date: '2024-07-16', resolution: '10m', anomaly_detected: 'No', recommendations: 'On track for expected yield' }
  ],
  Equipment: [
    { name: 'John Deere 8R 410 Tractor', type: 'Tractor', status: 'Operational', last_maintenance: '2024-06-01', next_maintenance: '2024-09-01', cost_per_hour: '$45', utilization_rate: '78%', farm_assigned: 'Green Valley Farm' },
    { name: 'Case IH 9250 Combine', type: 'Combine Harvester', status: 'Operational', last_maintenance: '2024-05-15', next_maintenance: '2024-08-15', cost_per_hour: '$120', utilization_rate: '45%', farm_assigned: 'Sunrise Acres' },
    { name: 'John Deere 1795 Planter', type: 'Planter', status: 'Idle', last_maintenance: '2024-04-20', next_maintenance: '2025-03-01', cost_per_hour: '$65', utilization_rate: '22%', farm_assigned: 'Prairie Wind Ranch' },
    { name: 'CLAAS Lexion 8900 Combine', type: 'Combine Harvester', status: 'Operational', last_maintenance: '2024-06-10', next_maintenance: '2024-09-10', cost_per_hour: '$135', utilization_rate: '52%', farm_assigned: 'Thunder Plains Co-op' },
    { name: 'Kubota M7-172 Tractor', type: 'Tractor', status: 'Maintenance', last_maintenance: '2024-07-01', next_maintenance: '2024-07-15', cost_per_hour: '$35', utilization_rate: '65%', farm_assigned: 'Cedar Creek Farm' },
    { name: 'Valley 8120 Center Pivot', type: 'Irrigation System', status: 'Operational', last_maintenance: '2024-03-15', next_maintenance: '2024-12-15', cost_per_hour: '$15', utilization_rate: '88%', farm_assigned: 'Heartland Growers' },
    { name: 'John Deere R4045 Sprayer', type: 'Sprayer', status: 'Operational', last_maintenance: '2024-05-20', next_maintenance: '2024-08-20', cost_per_hour: '$55', utilization_rate: '35%', farm_assigned: 'Blue Ridge Plantation' },
    { name: 'Caterpillar D6 Bulldozer', type: 'Earthmover', status: 'Idle', last_maintenance: '2024-02-10', next_maintenance: '2024-11-10', cost_per_hour: '$85', utilization_rate: '12%', farm_assigned: 'Eagle Point Farm' },
    { name: 'New Holland CR10.90 Combine', type: 'Combine Harvester', status: 'Operational', last_maintenance: '2024-06-05', next_maintenance: '2024-09-05', cost_per_hour: '$125', utilization_rate: '48%', farm_assigned: 'Morning Dew Farms' },
    { name: 'Fendt 1050 Vario Tractor', type: 'Tractor', status: 'Operational', last_maintenance: '2024-05-25', next_maintenance: '2024-08-25', cost_per_hour: '$50', utilization_rate: '72%', farm_assigned: 'Willow Brook Estate' },
    { name: 'Hagie STS16 Sprayer', type: 'Sprayer', status: 'Operational', last_maintenance: '2024-06-15', next_maintenance: '2024-09-15', cost_per_hour: '$48', utilization_rate: '32%', farm_assigned: 'Riverside Meadows' },
    { name: 'Kinze 4905 Grain Cart', type: 'Grain Cart', status: 'Idle', last_maintenance: '2024-04-01', next_maintenance: '2024-10-01', cost_per_hour: '$25', utilization_rate: '18%', farm_assigned: 'Dusty Trails Ranch' },
    { name: 'AGCO Massey Ferguson 8S', type: 'Tractor', status: 'Operational', last_maintenance: '2024-06-20', next_maintenance: '2024-09-20', cost_per_hour: '$42', utilization_rate: '68%', farm_assigned: 'Silver Lake Agricultural' },
    { name: 'DJI Agras T40 Drone', type: 'Agricultural Drone', status: 'Operational', last_maintenance: '2024-07-01', next_maintenance: '2024-08-01', cost_per_hour: '$18', utilization_rate: '55%', farm_assigned: 'Maple Ridge Organics' },
    { name: 'Trimble GFX-1260 GPS', type: 'Precision Guidance', status: 'Operational', last_maintenance: '2024-05-10', next_maintenance: '2025-05-10', cost_per_hour: '$8', utilization_rate: '82%', farm_assigned: 'Golden Harvest Fields' }
  ],
  LaborPlan: [
    { task_name: 'Spring Planting - Corn', workers_needed: '12', skill_level: 'Intermediate', duration: '21 days', cost_estimate: '$48,000', season: 'Spring 2024', priority: 'High', department: 'Field Operations' },
    { task_name: 'Wheat Harvesting', workers_needed: '15', skill_level: 'Expert', duration: '14 days', cost_estimate: '$52,500', season: 'Summer 2024', priority: 'High', department: 'Field Operations' },
    { task_name: 'Irrigation System Setup', workers_needed: '6', skill_level: 'Expert', duration: '10 days', cost_estimate: '$24,000', season: 'Spring 2024', priority: 'High', department: 'Maintenance' },
    { task_name: 'Pesticide Application', workers_needed: '8', skill_level: 'Expert', duration: '7 days', cost_estimate: '$22,400', season: 'Summer 2024', priority: 'High', department: 'Crop Protection' },
    { task_name: 'Soil Sampling & Testing', workers_needed: '4', skill_level: 'Intermediate', duration: '5 days', cost_estimate: '$8,000', season: 'Spring 2024', priority: 'Medium', department: 'Agronomy' },
    { task_name: 'Equipment Maintenance', workers_needed: '5', skill_level: 'Expert', duration: '14 days', cost_estimate: '$28,000', season: 'Winter 2024', priority: 'Medium', department: 'Maintenance' },
    { task_name: 'Grain Storage Management', workers_needed: '6', skill_level: 'Intermediate', duration: '30 days', cost_estimate: '$36,000', season: 'Fall 2024', priority: 'Medium', department: 'Logistics' },
    { task_name: 'Crop Scouting', workers_needed: '3', skill_level: 'Intermediate', duration: '60 days', cost_estimate: '$27,000', season: 'Summer 2024', priority: 'Medium', department: 'Agronomy' },
    { task_name: 'Fertilizer Application', workers_needed: '8', skill_level: 'Intermediate', duration: '10 days', cost_estimate: '$24,000', season: 'Spring 2024', priority: 'High', department: 'Field Operations' },
    { task_name: 'Fence Repair & Maintenance', workers_needed: '4', skill_level: 'Entry', duration: '14 days', cost_estimate: '$11,200', season: 'Spring 2024', priority: 'Low', department: 'Maintenance' },
    { task_name: 'Drone Survey Operations', workers_needed: '2', skill_level: 'Expert', duration: '20 days', cost_estimate: '$16,000', season: 'Summer 2024', priority: 'Medium', department: 'Technology' },
    { task_name: 'Soybean Harvesting', workers_needed: '14', skill_level: 'Expert', duration: '18 days', cost_estimate: '$63,000', season: 'Fall 2024', priority: 'High', department: 'Field Operations' },
    { task_name: 'Cover Crop Planting', workers_needed: '6', skill_level: 'Entry', duration: '7 days', cost_estimate: '$10,500', season: 'Fall 2024', priority: 'Medium', department: 'Field Operations' },
    { task_name: 'Water Quality Monitoring', workers_needed: '2', skill_level: 'Intermediate', duration: '30 days', cost_estimate: '$12,000', season: 'Year-round', priority: 'Low', department: 'Environmental' },
    { task_name: 'Safety Training Program', workers_needed: '25', skill_level: 'Entry', duration: '3 days', cost_estimate: '$15,000', season: 'Spring 2024', priority: 'High', department: 'Administration' }
  ],
  Sustainability: [
    { farm_name: 'Green Valley Farm', carbon_footprint: '2.8 tons CO2/acre', water_usage: '18 inches/acre', biodiversity_score: '78', renewable_energy: '35%', waste_reduction: '82%', certification: 'Sustainable Agriculture', overall_score: '82' },
    { farm_name: 'Sunrise Acres', carbon_footprint: '3.2 tons CO2/acre', water_usage: '22 inches/acre', biodiversity_score: '65', renewable_energy: '20%', waste_reduction: '75%', certification: 'None', overall_score: '68' },
    { farm_name: 'Prairie Wind Ranch', carbon_footprint: '2.5 tons CO2/acre', water_usage: '16 inches/acre', biodiversity_score: '82', renewable_energy: '45%', waste_reduction: '88%', certification: 'Rainforest Alliance', overall_score: '85' },
    { farm_name: 'Golden Harvest Fields', carbon_footprint: '4.1 tons CO2/acre', water_usage: '38 inches/acre', biodiversity_score: '55', renewable_energy: '10%', waste_reduction: '60%', certification: 'None', overall_score: '52' },
    { farm_name: 'Blue Ridge Plantation', carbon_footprint: '3.5 tons CO2/acre', water_usage: '25 inches/acre', biodiversity_score: '60', renewable_energy: '15%', waste_reduction: '70%', certification: 'None', overall_score: '62' },
    { farm_name: 'Heartland Growers', carbon_footprint: '2.9 tons CO2/acre', water_usage: '19 inches/acre', biodiversity_score: '75', renewable_energy: '30%', waste_reduction: '80%', certification: 'Sustainable Agriculture', overall_score: '78' },
    { farm_name: 'Cedar Creek Farm', carbon_footprint: '3.8 tons CO2/acre', water_usage: '28 inches/acre', biodiversity_score: '58', renewable_energy: '12%', waste_reduction: '65%', certification: 'None', overall_score: '58' },
    { farm_name: 'Willow Brook Estate', carbon_footprint: '2.2 tons CO2/acre', water_usage: '14 inches/acre', biodiversity_score: '88', renewable_energy: '55%', waste_reduction: '92%', certification: 'Organic', overall_score: '90' },
    { farm_name: 'Thunder Plains Co-op', carbon_footprint: '3.0 tons CO2/acre', water_usage: '20 inches/acre', biodiversity_score: '72', renewable_energy: '25%', waste_reduction: '78%', certification: 'Sustainable Agriculture', overall_score: '75' },
    { farm_name: 'Maple Ridge Organics', carbon_footprint: '1.8 tons CO2/acre', water_usage: '12 inches/acre', biodiversity_score: '95', renewable_energy: '70%', waste_reduction: '95%', certification: 'USDA Organic', overall_score: '96' },
    { farm_name: 'Riverside Meadows', carbon_footprint: '3.1 tons CO2/acre', water_usage: '21 inches/acre', biodiversity_score: '68', renewable_energy: '22%', waste_reduction: '72%', certification: 'None', overall_score: '66' },
    { farm_name: 'Eagle Point Farm', carbon_footprint: '3.4 tons CO2/acre', water_usage: '24 inches/acre', biodiversity_score: '62', renewable_energy: '18%', waste_reduction: '68%', certification: 'Fair Trade', overall_score: '64' },
    { farm_name: 'Silver Lake Agricultural', carbon_footprint: '2.6 tons CO2/acre', water_usage: '17 inches/acre', biodiversity_score: '80', renewable_energy: '40%', waste_reduction: '85%', certification: 'Sustainable Agriculture', overall_score: '83' },
    { farm_name: 'Dusty Trails Ranch', carbon_footprint: '4.5 tons CO2/acre', water_usage: '30 inches/acre', biodiversity_score: '42', renewable_energy: '5%', waste_reduction: '50%', certification: 'None', overall_score: '45' },
    { farm_name: 'Morning Dew Farms', carbon_footprint: '2.7 tons CO2/acre', water_usage: '18 inches/acre', biodiversity_score: '76', renewable_energy: '32%', waste_reduction: '83%', certification: 'Rainforest Alliance', overall_score: '80' }
  ]
};

const models = {
  YieldPrediction,
  MarketPrice,
  WeatherAnalysis,
  SoilHealth,
  CropRecommendation,
  PestAlert,
  IrrigationPlan,
  HarvestPlan,
  MarketTrend,
  SupplyChain,
  FinancialPlan,
  SatelliteData,
  Equipment,
  LaborPlan,
  Sustainability
};

(async () => {
  try {
    console.log('Starting AgriYield database seed...\n');
    await sequelize.sync({ force: true });
    console.log('Database synced (tables recreated)\n');

    const email = process.env.ADMIN_EMAIL || process.env.DEMO_EMAIL || process.env.DEFAULT_EMAIL;
    const password = process.env.ADMIN_PASSWORD || process.env.DEMO_PASSWORD || process.env.DEFAULT_PASSWORD;
    if (!email || !password) throw new Error('Explicit demo administrator credentials are required');
    await AuthUser.create({ email, password_hash: await bcrypt.hash(password, 10), name: 'Runtime Administrator', role: 'admin' });

    for (const [modelName, data] of Object.entries(seedData)) {
      const model = models[modelName];
      if (model) {
        await model.bulkCreate(data);
        console.log(`  Seeded ${modelName}: ${data.length} records`);
      }
    }

    console.log('\nAll seed data loaded successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
})();

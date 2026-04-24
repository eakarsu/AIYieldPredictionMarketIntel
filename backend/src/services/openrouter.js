const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const featurePrompts = {
  yieldPrediction: (data) =>
    `Analyze the following farm data and provide a yield prediction with confidence score.\nFarm: ${data.farm_name || 'N/A'}, Crop: ${data.crop_type || 'N/A'}, Acreage: ${data.acreage || 'N/A'}, Soil Type: ${data.soil_type || 'N/A'}, Irrigation: ${data.irrigation_type || 'N/A'}, Season: ${data.season || 'N/A'}.\nProvide predicted_yield (tons/acre), confidence (0-1), and reasoning.`,

  marketPrice: (data) =>
    `Analyze market conditions for ${data.commodity || 'the commodity'}. Current price: ${data.current_price || 'N/A'} per ${data.unit || 'unit'}, Market: ${data.market || 'N/A'}.\nProvide predicted_price, change_percent, supply_level (low/medium/high), and demand_level (low/medium/high).`,

  weatherAnalysis: (data) =>
    `Analyze weather impact on agriculture for location: ${data.location || 'N/A'}. Temperature: ${data.temperature || 'N/A'}°C, Humidity: ${data.humidity || 'N/A'}%, Rainfall: ${data.rainfall || 'N/A'}mm, Wind: ${data.wind_speed || 'N/A'}km/h.\nProvide a forecast, impact_level (low/medium/high/critical), and which crops are most affected.`,

  soilHealth: (data) =>
    `Evaluate soil health for farm: ${data.farm_name || 'N/A'}. pH: ${data.ph_level || 'N/A'}, Nitrogen: ${data.nitrogen || 'N/A'}, Phosphorus: ${data.phosphorus || 'N/A'}, Potassium: ${data.potassium || 'N/A'}, Organic Matter: ${data.organic_matter || 'N/A'}%, Moisture: ${data.moisture || 'N/A'}%.\nProvide a health_score (0-100) and recommendations for improvement.`,

  cropRecommendation: (data) =>
    `Recommend the best crop for region: ${data.region || 'N/A'}. Consider soil requirements, water needs, market demand, and expected ROI.\nProvide recommended_crop, expected_roi (%), growth_period, water_needs, soil_requirement, market_demand level, and risk_level.`,

  pestAlert: (data) =>
    `Analyze pest threat: ${data.pest_name || 'N/A'} affecting ${data.crop_affected || 'N/A'} at ${data.location || 'N/A'}. Severity: ${data.severity || 'N/A'}.\nProvide treatment recommendations, spread_risk assessment, and status update.`,

  irrigationPlan: (data) =>
    `Create an irrigation plan for farm: ${data.farm_name || 'N/A'}, Crop: ${data.crop_type || 'N/A'}, Season: ${data.season || 'N/A'}.\nProvide water_requirement (liters), optimal schedule, recommended method, efficiency_score (0-100), and cost_estimate.`,

  harvestPlan: (data) =>
    `Plan harvest for farm: ${data.farm_name || 'N/A'}, Crop: ${data.crop_type || 'N/A'}. Expected quantity: ${data.expected_quantity || 'N/A'} tons.\nProvide optimal_date, quality_grade prediction, best market_window, storage_needed, and priority level.`,

  marketTrend: (data) =>
    `Analyze market trends for ${data.commodity || 'the commodity'} in ${data.market || 'the market'} over ${data.period || 'the recent period'}.\nProvide trend_direction (up/down/stable), price_change (%), volume_change (%), forecast_accuracy, and detailed analysis.`,

  supplyChain: (data) =>
    `Optimize supply chain for ${data.product || 'the product'} from ${data.origin || 'origin'} to ${data.destination || 'destination'}.\nProvide optimal transit_time, estimated cost, recommended carrier, and status assessment.`,

  financialPlan: (data) =>
    `Create a financial plan for farm: ${data.farm_name || 'N/A'}, Budget: $${data.budget || 'N/A'}, Period: ${data.period || 'N/A'}.\nProvide revenue_forecast, expense_forecast, profit_margin (%), roi (%), and risk_assessment.`,

  satelliteData: (data) =>
    `Analyze satellite data for farm: ${data.farm_name || 'N/A'}. NDVI: ${data.ndvi_index || 'N/A'}, Area: ${data.area_coverage || 'N/A'} hectares, Capture Date: ${data.capture_date || 'N/A'}.\nProvide crop_health assessment, anomaly_detected findings, and actionable recommendations.`,

  equipment: (data) =>
    `Assess equipment status: ${data.name || 'N/A'} (${data.type || 'N/A'}). Status: ${data.status || 'N/A'}, Last Maintenance: ${data.last_maintenance || 'N/A'}, Utilization: ${data.utilization_rate || 'N/A'}%.\nProvide next_maintenance recommendation, cost_per_hour estimate, and optimization suggestions.`,

  laborPlan: (data) =>
    `Plan labor for task: ${data.task_name || 'N/A'}, Season: ${data.season || 'N/A'}, Department: ${data.department || 'N/A'}.\nProvide workers_needed, required skill_level, estimated duration, cost_estimate, and priority assessment.`,

  sustainability: (data) =>
    `Evaluate sustainability for farm: ${data.farm_name || 'N/A'}. Carbon Footprint: ${data.carbon_footprint || 'N/A'}, Water Usage: ${data.water_usage || 'N/A'}, Renewable Energy: ${data.renewable_energy || 'N/A'}%.\nProvide biodiversity_score, waste_reduction recommendations, certification eligibility, and overall_score (0-100).`,
};

async function getAIAnalysis(feature, data) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  // Convert display names like "Market Price" to camelCase keys like "marketPrice"
  const featureKey = feature.replace(/\s+(.)/g, (_, c) => c.toUpperCase()).replace(/^\w/, c => c.toLowerCase());
  const promptBuilder = featurePrompts[featureKey] || featurePrompts[feature];
  if (!promptBuilder) {
    throw new Error(`Unknown feature type: ${feature}`);
  }

  const userPrompt = promptBuilder(data);

  const requestBody = {
    model: OPENROUTER_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are an expert agricultural AI analyst. Provide data-driven insights and predictions for farming operations. Always respond with structured JSON when possible.',
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  };

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      'X-Title': 'AI Yield Prediction & Market Intel',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
  }

  const result = await response.json();

  if (!result.choices || result.choices.length === 0) {
    throw new Error('No response from OpenRouter API');
  }

  const content = result.choices[0].message.content;

  // Attempt to parse as JSON; fall back to raw text
  try {
    return JSON.parse(content);
  } catch {
    return { analysis: content };
  }
}

module.exports = { getAIAnalysis };

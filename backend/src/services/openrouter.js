const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

function openRouterConfig() {
  const apiKey = String(process.env.OPENROUTER_API_KEY || '').trim();
  const model = String(process.env.OPENROUTER_MODEL || '').trim();
  const baseUrl = String(process.env.OPENROUTER_BASE_URL || '').replace(/\/+$/, '');
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');
  if (!model) throw new Error('OPENROUTER_MODEL is not configured');
  if (baseUrl !== 'https://openrouter.ai/api/v1') throw new Error('OPENROUTER_BASE_URL must be https://openrouter.ai/api/v1');
  return { apiKey, model, endpoint: `${baseUrl}/chat/completions` };
}

function parseAIJson(text) {
  try { return JSON.parse(text); } catch (e) {}
  const stripped = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  try { return JSON.parse(stripped); } catch (e) {}
  const start = text.indexOf('{'); const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) { try { return JSON.parse(text.slice(start, end + 1)); } catch (e) {} }
  return null;
}

const featurePrompts = {
  yieldPrediction: (data) =>
    `Analyze this farm data for a comprehensive yield prediction with confidence interval.
Farm: ${data.farm_name || 'N/A'}, Crop: ${data.crop_type || 'N/A'}, Acreage: ${data.acreage || 'N/A'} acres, Soil: ${data.soil_type || 'N/A'}, Irrigation: ${data.irrigation_type || 'N/A'}, Season: ${data.season || 'N/A'}.
Return JSON only: { "predicted_yield": number, "confidence": number, "confidence_interval": {"low": number, "high": number}, "yield_limiting_factors": [string], "optimization_recommendations": [string], "reasoning": string }`,

  marketPrice: (data) =>
    `Analyze market conditions for ${data.commodity || 'commodity'}. Current: $${data.current_price || 'N/A'}/${data.unit || 'unit'}, Market: ${data.market || 'N/A'}.
Return JSON only: { "predicted_price": number, "change_percent": number, "supply_level": "low|medium|high", "demand_level": "low|medium|high", "price_drivers": [string], "risk_factors": [string], "recommendation": string }`,

  weatherAnalysis: (data) =>
    `Analyze weather impact. Location: ${data.location || 'N/A'}, Temp: ${data.temperature || 'N/A'}C, Humidity: ${data.humidity || 'N/A'}%, Rainfall: ${data.rainfall || 'N/A'}mm.
Return JSON only: { "forecast": string, "impact_level": "low|medium|high|critical", "crop_affected": string, "risk_windows": [string], "mitigation_actions": [string] }`,

  soilHealth: (data) =>
    `Evaluate soil. Farm: ${data.farm_name || 'N/A'}, pH: ${data.ph_level || 'N/A'}, N: ${data.nitrogen || 'N/A'}, P: ${data.phosphorus || 'N/A'}, K: ${data.potassium || 'N/A'}, OM: ${data.organic_matter || 'N/A'}%, Moisture: ${data.moisture || 'N/A'}%.
Return JSON only: { "health_score": number, "grade": string, "deficiencies": [string], "amendments_needed": [{"nutrient": string, "amount": string}], "crop_suitability": [string] }`,

  cropRecommendation: (data) =>
    `Recommend best crop for region: ${data.region || 'N/A'}.
Return JSON only: { "recommended_crop": string, "expected_roi": number, "growth_period": string, "water_needs": string, "soil_requirement": string, "market_demand": string, "risk_level": string, "alternative_crops": [{"crop": string, "roi": number}] }`,

  pestAlert: (data) =>
    `Analyze pest: ${data.pest_name || 'N/A'} on ${data.crop_affected || 'N/A'} at ${data.location || 'N/A'}. Severity: ${data.severity || 'N/A'}.
Return JSON only: { "treatment": string, "spread_risk": "low|medium|high|critical", "status": string, "chemical_options": [string], "organic_options": [string], "economic_threshold": string }`,

  irrigationPlan: (data) =>
    `Create irrigation plan. Farm: ${data.farm_name || 'N/A'}, Crop: ${data.crop_type || 'N/A'}, Season: ${data.season || 'N/A'}.
Return JSON only: { "water_requirement": number, "schedule": string, "method": string, "efficiency_score": number, "cost_estimate": number, "water_savings_percent": number }`,

  harvestPlan: (data) =>
    `Plan harvest. Farm: ${data.farm_name || 'N/A'}, Crop: ${data.crop_type || 'N/A'}, Quantity: ${data.expected_quantity || 'N/A'} tons.
Return JSON only: { "optimal_date": string, "quality_grade": string, "market_window": string, "storage_needed": number, "priority": string, "logistics_plan": string }`,

  marketTrend: (data) =>
    `Analyze market trends for ${data.commodity || 'commodity'} in ${data.market || 'market'}.
Return JSON only: { "trend_direction": "up|down|stable|volatile", "price_change": number, "volume_change": number, "forecast_accuracy": number, "analysis": string, "price_targets": {"30d": number, "90d": number} }`,

  supplyChain: (data) =>
    `Optimize supply chain for ${data.product || 'product'} from ${data.origin || 'origin'} to ${data.destination || 'destination'}.
Return JSON only: { "transit_time": string, "cost": number, "carrier": string, "status": string, "bottlenecks": [string], "cost_reduction_opportunities": [string] }`,

  financialPlan: (data) =>
    `Create financial plan. Farm: ${data.farm_name || 'N/A'}, Budget: $${data.budget || 'N/A'}, Period: ${data.period || 'N/A'}.
Return JSON only: { "revenue_forecast": number, "expense_forecast": number, "profit_margin": number, "roi": number, "risk_assessment": string, "break_even_point": string }`,

  satelliteData: (data) =>
    `Analyze satellite data. Farm: ${data.farm_name || 'N/A'}, NDVI: ${data.ndvi_index || 'N/A'}, Area: ${data.area_coverage || 'N/A'} ha.
Return JSON only: { "crop_health": "poor|fair|good|excellent", "anomaly_detected": string, "recommendations": string, "stress_zones": [string], "yield_impact_estimate": string }`,

  equipment: (data) =>
    `Assess equipment: ${data.name || 'N/A'} (${data.type || 'N/A'}), Status: ${data.status || 'N/A'}.
Return JSON only: { "next_maintenance": string, "cost_per_hour": number, "failure_risk": "low|medium|high", "maintenance_items": [string], "replacement_timeline": string }`,

  laborPlan: (data) =>
    `Plan labor for: ${data.task_name || 'N/A'}, Season: ${data.season || 'N/A'}.
Return JSON only: { "workers_needed": number, "skill_level": string, "duration": string, "cost_estimate": number, "priority": string, "training_requirements": [string] }`,

  sustainability: (data) =>
    `Evaluate sustainability for farm: ${data.farm_name || 'N/A'}, Carbon: ${data.carbon_footprint || 'N/A'}, Water: ${data.water_usage || 'N/A'}.
Return JSON only: { "biodiversity_score": number, "waste_reduction": number, "certification": string, "overall_score": number, "carbon_reduction_roadmap": [string], "esg_rating": string }`,
};

async function getAIAnalysis(feature, data) {
  const { apiKey, model, endpoint } = openRouterConfig();
  const featureKey = feature.replace(/\s+(.)/g, (_, c) => c.toUpperCase()).replace(/^\w/, c => c.toLowerCase());
  const promptBuilder = featurePrompts[featureKey] || featurePrompts[feature];
  if (!promptBuilder) throw new Error(`Unknown feature type: ${feature}`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      'X-Title': 'AI Yield Prediction & Market Intel',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are an expert agricultural AI analyst. Always respond with valid JSON only, no markdown fences.' },
        { role: 'user', content: promptBuilder(data) },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error('No response from OpenRouter API');
  return parseAIJson(content) || { analysis: content };
}

async function callOpenRouterRaw(systemPrompt, userPrompt, imageBase64 = null) {
  const { apiKey, model, endpoint } = openRouterConfig();

  const userContent = imageBase64
    ? [
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        { type: 'text', text: userPrompt },
      ]
    : userPrompt;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      'X-Title': 'AI Yield Prediction & Market Intel',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error('No response from OpenRouter API');
  return parseAIJson(content) || { analysis: content };
}

module.exports = { getAIAnalysis, callOpenRouterRaw, parseAIJson };

// Custom feature endpoints (batch_09 audit suggestions)
const express = require('express');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { callOpenRouterRaw, parseAIJson } = require('../services/openrouter');
const router = express.Router();

function sendAiError(res, err, label) {
  const msg = err?.message || '';
  if (/OPENROUTER_API_KEY/i.test(msg)) return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY is not configured' });
  console.error(`${label} error:`, msg);
  return res.status(500).json({ error: msg });
}

async function ask(system, user, label, res) {
  try {
    const raw = await callOpenRouterRaw(system, user);
    res.json({ type: label, result: parseAIJson(raw) || { raw } });
  } catch (e) { sendAiError(res, e, label); }
}

// 1. Multi-modal yield modeling (satellite + soil sensors + weather + history)
router.post('/multimodal-yield', aiRateLimiter, async (req, res) => {
  const { farm, satellite_indices, soil_sensors, weather_30d, history } = req.body || {};
  if (!farm) return res.status(400).json({ error: 'farm required' });
  return ask(
    'You combine satellite NDVI, soil sensors, weather history, and yield history into a high-confidence yield prediction. JSON only.',
    `FARM: ${JSON.stringify(farm)}\nSAT: ${JSON.stringify(satellite_indices || {})}\nSOIL: ${JSON.stringify(soil_sensors || {})}\nWEATHER: ${JSON.stringify(weather_30d || {})}\nHISTORY: ${JSON.stringify(history || [])}\nReturn JSON {"yield_bu_per_acre":0,"confidence":0,"contributing_signals":[""],"sensitivity":{"weather":0,"soil":0,"history":0}}`,
    'multimodal-yield', res
  );
});

// 2. Drone leaf-imagery pest/disease detection (text proxy v0)
// TODO: configure credentials for DRONE_IMAGE_PIPELINE_KEY.
router.post('/drone-pest-detection', aiRateLimiter, async (req, res) => {
  const { field_id, image_captions, crop } = req.body || {};
  if (!field_id) return res.status(400).json({ error: 'field_id required' });
  return ask(
    `You assess pest/disease from drone imagery descriptions. Drone pipeline: ${Boolean(process.env.DRONE_IMAGE_PIPELINE_KEY)}. JSON only.`,
    `FIELD: ${field_id}\nCROP: ${crop || 'unknown'}\nCAPTIONS: ${JSON.stringify(image_captions || [])}\nReturn JSON {"likely_threats":[{"name":"","confidence":0,"infestation_pct":0}],"recommended_treatment":[""],"reassess_in_days":7}`,
    'drone-pest-detection', res
  );
});

// 3. Commodity price forecasting with external market data
// TODO: configure credentials for COMMODITY_FEED_API_KEY (USDA/CME).
router.post('/commodity-forecast', aiRateLimiter, async (req, res) => {
  const { commodity, horizon_days = 30, signals } = req.body || {};
  if (!commodity) return res.status(400).json({ error: 'commodity required' });
  return ask(
    `You forecast commodity prices. Market feed: ${Boolean(process.env.COMMODITY_FEED_API_KEY)}. JSON only.`,
    `COMMODITY: ${commodity}\nHORIZON_DAYS: ${horizon_days}\nSIGNALS: ${JSON.stringify(signals || {})}\nReturn JSON {"forecast":[{"day_offset":0,"price_usd_bu":0}],"trend":"up|flat|down","drivers":[""],"hedge_recommendation":""}`,
    'commodity-forecast', res
  );
});

// 4. Supply-chain risk modeling (harvest to market delays)
router.post('/supply-chain-risk', aiRateLimiter, async (req, res) => {
  const { harvest_date, route, storage_capacity, market_buyers } = req.body || {};
  if (!harvest_date) return res.status(400).json({ error: 'harvest_date required' });
  return ask(
    'You model harvest-to-market supply chain risk. JSON only.',
    `HARVEST: ${harvest_date}\nROUTE: ${JSON.stringify(route || {})}\nSTORAGE: ${storage_capacity || 'unknown'}\nBUYERS: ${JSON.stringify(market_buyers || [])}\nReturn JSON {"risk_score":0,"bottlenecks":[{"stage":"","probability":0,"impact_usd":0}],"mitigations":[""]}`,
    'supply-chain-risk', res
  );
});

// 5. Microclimate modeling for precision agriculture
router.post('/microclimate', aiRateLimiter, async (req, res) => {
  const { field_geo, sensor_grid, season } = req.body || {};
  if (!field_geo) return res.status(400).json({ error: 'field_geo required' });
  return ask(
    'You build a field microclimate map for precision ag. JSON only.',
    `GEO: ${JSON.stringify(field_geo)}\nSENSORS: ${JSON.stringify(sensor_grid || [])}\nSEASON: ${season || 'spring'}\nReturn JSON {"zones":[{"id":"","temp_anomaly_c":0,"moisture_pct":0,"frost_risk":"low|med|high"}],"variable_rate_recommendations":[{"input":"","by_zone":[]}]}`,
    'microclimate', res
  );
});

// 6. Water-usage optimization for drought/conservation
router.post('/water-optimize', aiRateLimiter, async (req, res) => {
  const { farm_id, crop, drought_level, irrigation_system } = req.body || {};
  if (!farm_id) return res.status(400).json({ error: 'farm_id required' });
  return ask(
    'You optimize irrigation schedule for drought / conservation goals. JSON only.',
    `FARM: ${farm_id}\nCROP: ${crop || 'corn'}\nDROUGHT: ${drought_level || 'D1'}\nSYSTEM: ${irrigation_system || 'center-pivot'}\nReturn JSON {"daily_schedule":[{"day":1,"inches":0,"window":""}],"projected_water_saved_pct":0,"yield_impact_pct":0,"sensors_to_add":[""]}`,
    'water-optimize', res
  );
});

// 7. Predictive equipment failure with parts pre-ordering
router.post('/equipment-failure', aiRateLimiter, async (req, res) => {
  const { equipment, telemetry, season_demand } = req.body || {};
  if (!equipment) return res.status(400).json({ error: 'equipment required' });
  return ask(
    'You predict equipment failure and pre-order parts. JSON only.',
    `EQUIPMENT: ${JSON.stringify(equipment)}\nTELEMETRY: ${JSON.stringify(telemetry || {})}\nSEASON_DEMAND: ${season_demand || 'high'}\nReturn JSON {"failure_probability_30d":0,"likely_components":[""],"parts_to_order":[{"part":"","qty":0,"lead_time_days":0}],"maintenance_window":""}`,
    'equipment-failure', res
  );
});

// 8. Integration with agricultural extension services
// TODO: configure credentials for EXTENSION_SERVICE_API_KEY (USDA NRCS).
router.post('/extension-services', aiRateLimiter, async (req, res) => {
  const { county, topic, farmer_question } = req.body || {};
  if (!county) return res.status(400).json({ error: 'county required' });
  return ask(
    `You route to agricultural extension resources. Service API: ${Boolean(process.env.EXTENSION_SERVICE_API_KEY)}. JSON only.`,
    `COUNTY: ${county}\nTOPIC: ${topic || 'general'}\nQUESTION: ${farmer_question || ''}\nReturn JSON {"recommended_resources":[{"name":"","contact":"","url":""}],"applicable_programs":[""],"funding_opportunities":[{"name":"","deadline":""}]}`,
    'extension-services', res
  );
});

module.exports = router;

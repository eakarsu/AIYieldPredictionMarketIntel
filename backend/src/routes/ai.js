const express = require('express');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { getAIAnalysis, callOpenRouterRaw } = require('../services/openrouter');
const { AiResult } = require('../models');
const router = express.Router();

// Helper: return 503 for missing-key errors, 500 otherwise
function sendAiError(res, err, label) {
  const msg = (err && err.message) || '';
  if (/OPENROUTER_API_KEY/i.test(msg)) {
    return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY is not configured' });
  }
  console.error(`${label} error:`, msg);
  return res.status(500).json({ error: msg });
}

router.get('/history', async (req, res) => {
  try {
    const history = await AiResult.findAll({
      where: { created_by: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 25, 100),
    });
    res.json({ history });
  } catch (err) {
    return sendAiError(res, err, 'history');
  }
});

// POST /api/ai/yield-prediction — authenticated, durable yield prediction
router.post('/yield-prediction', aiRateLimiter, async (req, res) => {
  try {
    const result = await getAIAnalysis('yieldPrediction', req.body || {});
    await AiResult.create({
      feature: 'yield-prediction',
      input_data: req.body || {},
      output_data: result,
      model_used: process.env.OPENROUTER_MODEL,
      created_by: req.user.id,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    return sendAiError(res, err, 'yield-prediction');
  }
});

// POST /api/ai/market-trend-forecast — direct ad-hoc market trend forecast
router.post('/market-trend-forecast', aiRateLimiter, async (req, res) => {
  try {
    const result = await getAIAnalysis('marketTrend', req.body || {});
    res.json({ success: true, data: result });
  } catch (err) {
    return sendAiError(res, err, 'market-trend-forecast');
  }
});

// POST /api/ai/pest-outbreak-prediction — predict pest outbreak risk over horizon
router.post('/pest-outbreak-prediction', aiRateLimiter, async (req, res) => {
  try {
    const { region, crop, season, recentSightings, weather, horizonDays = 30 } = req.body || {};
    const systemPrompt = 'You are an agricultural entomologist. Always respond with valid JSON only.';
    const userPrompt = `Predict pest outbreak risk for the next ${horizonDays} days.\n\nRegion: ${region || 'unknown'}\nCrop: ${crop || 'unknown'}\nSeason: ${season || 'unknown'}\nRecent sightings: ${JSON.stringify(recentSightings || [])}\nWeather: ${JSON.stringify(weather || {})}\n\nReturn JSON: { "outbreakRisk": "low|medium|high|critical", "expectedPests": [{ "pest": "", "probability": 0, "earliestDays": 0 }], "preventiveActions": ["..."], "monitoringPlan": ["..."], "summary": "" }`;
    const result = await callOpenRouterRaw(systemPrompt, userPrompt);
    res.json({ success: true, data: result });
  } catch (err) {
    return sendAiError(res, err, 'pest-outbreak-prediction');
  }
});

// POST /api/ai/irrigation-optimize — optimal irrigation schedule from inputs
router.post('/irrigation-optimize', aiRateLimiter, async (req, res) => {
  try {
    const { crop, acreage, soilType, irrigationMethod, recentRainfallMm, forecastRainfallMm, growthStage, region } = req.body || {};
    const systemPrompt = 'You are an agricultural irrigation engineer. Always respond with valid JSON only.';
    const userPrompt = `Optimize irrigation given inputs.\n\nCrop: ${crop || 'unknown'}\nAcreage: ${acreage || 'unknown'}\nSoil type: ${soilType || 'unknown'}\nIrrigation method: ${irrigationMethod || 'unknown'}\nRecent 7-day rainfall (mm): ${recentRainfallMm ?? 'unknown'}\nForecast 7-day rainfall (mm): ${forecastRainfallMm ?? 'unknown'}\nGrowth stage: ${growthStage || 'unknown'}\nRegion: ${region || 'unknown'}\n\nReturn JSON: { "schedule": [{"day": 1, "amountMm": 0, "duration_minutes": 0, "notes": ""}], "weeklyWaterRequirementMm": 0, "estimatedWaterSavingsPercent": 0, "method_recommendation": "drip|sprinkler|flood|center_pivot", "efficiency_score": 0, "warnings": ["..."], "summary": "" }`;
    const result = await callOpenRouterRaw(systemPrompt, userPrompt);
    res.json({ success: true, data: result });
  } catch (err) {
    return sendAiError(res, err, 'irrigation-optimize');
  }
});

// POST /api/ai/soil-amendment — recommend soil amendments from soil-test results
router.post('/soil-amendment', aiRateLimiter, async (req, res) => {
  try {
    const { ph, nitrogen, phosphorus, potassium, organicMatterPct, moisturePct, targetCrop, acreage } = req.body || {};
    const systemPrompt = 'You are a soil scientist and agronomist. Always respond with valid JSON only.';
    const userPrompt = `Recommend soil amendments.\n\npH: ${ph ?? 'unknown'}\nNitrogen (ppm): ${nitrogen ?? 'unknown'}\nPhosphorus (ppm): ${phosphorus ?? 'unknown'}\nPotassium (ppm): ${potassium ?? 'unknown'}\nOrganic matter %: ${organicMatterPct ?? 'unknown'}\nMoisture %: ${moisturePct ?? 'unknown'}\nTarget crop: ${targetCrop || 'unknown'}\nAcreage: ${acreage ?? 'unknown'}\n\nReturn JSON: { "soilHealthScore": 0, "grade": "A|B|C|D|F", "deficiencies": ["..."], "amendments": [{"product": "", "rate_per_acre": "", "reason": "", "estimated_cost_usd_per_acre": 0}], "estimatedTotalCostUsd": 0, "expectedYieldUpliftPercent": 0, "applicationSchedule": ["..."], "summary": "" }`;
    const result = await callOpenRouterRaw(systemPrompt, userPrompt);
    res.json({ success: true, data: result });
  } catch (err) {
    return sendAiError(res, err, 'soil-amendment');
  }
});

// POST /api/ai/equipment-maintenance — predictive maintenance forecast
router.post('/equipment-maintenance', aiRateLimiter, async (req, res) => {
  try {
    const { equipmentName, type, ageYears, hoursUsed, lastService, knownIssues, status } = req.body || {};
    const systemPrompt = 'You are an agricultural-equipment maintenance specialist. Always respond with valid JSON only.';
    const userPrompt = `Predict maintenance needs.\n\nEquipment: ${equipmentName || 'unknown'}\nType: ${type || 'unknown'}\nAge (years): ${ageYears ?? 'unknown'}\nHours used: ${hoursUsed ?? 'unknown'}\nLast service: ${lastService || 'unknown'}\nKnown issues: ${JSON.stringify(knownIssues || [])}\nCurrent status: ${status || 'unknown'}\n\nReturn JSON: { "failureRisk": "low|medium|high|critical", "next_service_in_days": 0, "scheduled_tasks": [{"task": "", "priority": "low|medium|high", "estimated_cost_usd": 0, "estimated_hours": 0}], "preventive_actions": ["..."], "replacement_horizon_years": 0, "summary": "" }`;
    const result = await callOpenRouterRaw(systemPrompt, userPrompt);
    res.json({ success: true, data: result });
  } catch (err) {
    return sendAiError(res, err, 'equipment-maintenance');
  }
});

// ============================================================
// APPLY PASS 5 — backlog endpoints
// ============================================================

// POST /api/ai/pest-vision-detect (NEEDS-PRODUCT-DECISION)
// PRODUCT-DECISION: Drone/imagery pest detection requires a vision model.
// We accept a base64 jpeg image (≤2MB after b64 encoding) and forward it
// via callOpenRouterRaw which already supports an image arg. No persistent
// image storage — we keep the call stateless to avoid storage decisions.
router.post('/pest-vision-detect', aiRateLimiter, async (req, res) => {
  try {
    const { image_base64, crop, region } = req.body || {};
    if (!image_base64 || typeof image_base64 !== 'string') {
      return res.status(400).json({ error: 'image_base64 (jpeg) is required' });
    }
    if (image_base64.length > 2_700_000) {
      return res.status(413).json({ error: 'Image too large (>2MB after base64). Reduce resolution.' });
    }
    const systemPrompt = 'You are an agricultural plant-pathology expert. Analyze the supplied field image. Always respond with valid JSON only.';
    const userPrompt = `Crop: ${crop || 'unknown'}; Region: ${region || 'unknown'}.\nReturn JSON: { "pests_detected": [{ "name": "", "severity": "low|medium|high|critical", "coverage_pct": 0, "confidence": 0 }], "diseases_detected": [{ "name": "", "severity": "" }], "recommended_actions": ["..."], "summary": "" }`;
    const result = await callOpenRouterRaw(systemPrompt, userPrompt, image_base64);
    res.json({ success: true, data: result });
  } catch (err) { return sendAiError(res, err, 'pest-vision-detect'); }
});

// POST /api/ai/commodity-futures (NEEDS-CREDS)
// Env: CME_API_URL, CME_API_KEY  (any commodities futures provider works)
router.post('/commodity-futures', aiRateLimiter, async (req, res) => {
  const missing = ['CME_API_URL', 'CME_API_KEY'].filter(k => !process.env[k]);
  if (missing.length) return res.status(503).json({ error: 'Commodity futures feed unavailable', missing: missing.join(', ') });
  // PRODUCT-DECISION: when creds are present, fetch front-month price &
  // produce an AI hedging recommendation. Implementation deferred until
  // a specific provider contract is selected.
  res.json({ success: false, error: 'Commodity futures pending implementation; creds detected.' });
});

// POST /api/ai/crop-insurance (NEEDS-CREDS)
// Env: CROP_INSURANCE_API_URL, CROP_INSURANCE_API_KEY
router.post('/crop-insurance', aiRateLimiter, async (req, res) => {
  const missing = ['CROP_INSURANCE_API_URL', 'CROP_INSURANCE_API_KEY'].filter(k => !process.env[k]);
  if (missing.length) return res.status(503).json({ error: 'Crop insurance API unavailable', missing: missing.join(', ') });
  res.json({ success: false, error: 'Crop insurance coordination pending implementation; creds detected.' });
});

// POST /api/ai/land-polygon-optimize (NEEDS-PRODUCT-DECISION)
// PRODUCT-DECISION: full GIS optimization needs a geo data model. We accept
// an array of GeoJSON-style polygon vertices and return AI-suggested zone
// allocations (no DB). A future iteration will persist to a geo schema.
router.post('/land-polygon-optimize', aiRateLimiter, async (req, res) => {
  try {
    const { polygons, soilSamples, currentCrops, climateZone } = req.body || {};
    if (!Array.isArray(polygons) || polygons.length === 0) {
      return res.status(400).json({ error: 'polygons[] required (each polygon: { id, vertices: [[lng,lat],...] , acreage })' });
    }
    const systemPrompt = 'You are a precision-agriculture planner. Always respond with valid JSON only.';
    const userPrompt = `Optimize land use across these polygons.\n\nPolygons: ${JSON.stringify(polygons).slice(0, 6000)}\nSoil samples: ${JSON.stringify(soilSamples || []).slice(0, 4000)}\nCurrent crops: ${JSON.stringify(currentCrops || [])}\nClimate zone: ${climateZone || 'unknown'}\n\nReturn JSON: { "allocations": [{ "polygon_id": "", "recommended_crop": "", "rationale": "", "expected_yield_per_acre": 0, "rotation_horizon_years": 0 }], "ecological_notes": ["..."], "summary": "" }`;
    const result = await callOpenRouterRaw(systemPrompt, userPrompt);
    res.json({ success: true, data: result });
  } catch (err) { return sendAiError(res, err, 'land-polygon-optimize'); }
});

// POST /api/ai/coop-marketing (NEEDS-PRODUCT-DECISION)
// PRODUCT-DECISION: full co-op marketing module is multi-tenant social.
// We start with a single-farmer endpoint that drafts a marketing plan and
// pricing strategy for joining a co-op or selling direct, given inventory.
router.post('/coop-marketing', aiRateLimiter, async (req, res) => {
  try {
    const { region, crops, monthlyVolume, currentChannels, targetMargin, coopOptions } = req.body || {};
    const systemPrompt = 'You are an agricultural-marketing strategist for farming co-operatives. Always respond with valid JSON only.';
    const userPrompt = `Recommend a marketing strategy.\n\nRegion: ${region || 'unknown'}\nCrops: ${JSON.stringify(crops || [])}\nMonthly volume (units): ${monthlyVolume ?? 'unknown'}\nCurrent channels: ${JSON.stringify(currentChannels || [])}\nTarget margin (%): ${targetMargin ?? 'unspecified'}\nCo-op options: ${JSON.stringify(coopOptions || [])}\n\nReturn JSON: { "best_channel_mix": [{"channel":"","share_pct":0,"rationale":""}], "coop_join_recommendation": "join|negotiate|skip", "pricing_strategy": "", "branding_ideas": ["..."], "risk_factors": ["..."], "summary": "" }`;
    const result = await callOpenRouterRaw(systemPrompt, userPrompt);
    res.json({ success: true, data: result });
  } catch (err) { return sendAiError(res, err, 'coop-marketing'); }
});

module.exports = router;

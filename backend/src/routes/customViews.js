const express = require('express');
const router = express.Router();

// In-memory storage for signal rules
let signalRules = [
  { id: 1, name: 'Corn Bullish Trigger', commodity: 'Corn', condition: 'price_above', threshold: 7.50, action: 'BUY', enabled: true, createdAt: new Date().toISOString() },
  { id: 2, name: 'Wheat Stop Loss', commodity: 'Wheat', condition: 'price_below', threshold: 5.20, action: 'SELL', enabled: true, createdAt: new Date().toISOString() },
  { id: 3, name: 'Soybean Volatility Alert', commodity: 'Soybean', condition: 'pct_change_above', threshold: 5.0, action: 'ALERT', enabled: true, createdAt: new Date().toISOString() },
  { id: 4, name: 'Rice Floor Support', commodity: 'Rice', condition: 'price_below', threshold: 16.00, action: 'BUY', enabled: false, createdAt: new Date().toISOString() },
];
let nextRuleId = 5;

// 1. VIZ: Yield Forecast Line Chart - returns time-series yield forecasts
router.get('/yield-forecast', (req, res) => {
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const crops = ['Corn', 'Wheat', 'Soybean'];
    const baseYields = { Corn: 175, Wheat: 52, Soybean: 51 };
    const series = crops.map(crop => ({
      crop,
      data: months.map((m, i) => {
        const base = baseYields[crop];
        const seasonal = Math.sin((i / 12) * 2 * Math.PI) * 8;
        const trend = i * 0.4;
        const noise = (Math.sin(i * crop.length) * 3);
        return {
          month: m,
          actual: i < 6 ? Math.round((base + seasonal + trend + noise) * 10) / 10 : null,
          forecast: Math.round((base + seasonal + trend + noise + (i >= 6 ? 2 : 0)) * 10) / 10,
          confidence_low: Math.round((base + seasonal + trend - 5) * 10) / 10,
          confidence_high: Math.round((base + seasonal + trend + 7) * 10) / 10,
        };
      }),
    }));
    res.json({
      success: true,
      unit: 'bushels/acre',
      generated_at: new Date().toISOString(),
      series,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. VIZ: Commodity x Region Heatmap - price strength matrix
router.get('/commodity-region-heatmap', (req, res) => {
  try {
    const commodities = ['Corn', 'Wheat', 'Soybean', 'Rice', 'Barley', 'Cotton'];
    const regions = ['Midwest', 'Great Plains', 'South', 'West', 'Northeast'];
    const matrix = commodities.map((c, ci) => ({
      commodity: c,
      values: regions.map((r, ri) => {
        const seed = (ci + 1) * (ri + 2);
        const strength = Math.round(((Math.sin(seed) + 1) * 50 + 20));
        return {
          region: r,
          strength,
          price: Math.round((50 + (Math.cos(seed) * 25)) * 100) / 100,
          volume: Math.round(strength * 100),
        };
      }),
    }));
    res.json({
      success: true,
      legend: 'Price strength index (0-100). Higher = stronger demand.',
      commodities,
      regions,
      matrix,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. NON-VIZ: Market Intel Report PDF - text-based downloadable report
router.get('/market-intel-report', (req, res) => {
  try {
    const now = new Date();
    const report = {
      title: 'AgriYield Market Intelligence Report',
      generated_at: now.toISOString(),
      period: `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`,
      executive_summary: 'Commodity markets show mixed signals with corn maintaining bullish bias on tight stocks while wheat faces pressure from increased global supply. Soybean outlook remains constructive on biofuel demand growth.',
      sections: [
        { heading: 'Yield Outlook', body: 'USDA projects record corn yield of 181 bu/acre. Wheat expected at 52 bu/acre, soybean at 51 bu/acre. La Nina pattern raises drought risk for Q3.' },
        { heading: 'Price Trends', body: 'Corn +12% YTD, Wheat -8% YTD, Soybean +5% YTD. Volatility elevated across grain complex with implied vols at 6-month highs.' },
        { heading: 'Supply & Demand', body: 'Global wheat stocks at 268 MMT (-3% YoY). Corn ending stocks projected 2.1B bu (+8%). Soybean crush margins healthy at $1.85/bu.' },
        { heading: 'Risk Factors', body: 'Weather volatility (drought/flood), geopolitical disruption to Black Sea exports, currency fluctuation impacting US export competitiveness.' },
        { heading: 'Recommendations', body: 'Increase corn hedge ratio to 60%. Reduce wheat exposure ahead of Northern Hemisphere harvest. Maintain long soybean bias into Q4.' },
      ],
      key_metrics: {
        corn_price: 7.45,
        wheat_price: 5.85,
        soybean_price: 13.20,
        forecast_confidence: 0.84,
      },
    };

    // Minimal PDF generation (PDF 1.4) with report content
    const lines = [];
    lines.push(report.title);
    lines.push(`Generated: ${report.generated_at}`);
    lines.push(`Period: ${report.period}`);
    lines.push('');
    lines.push('EXECUTIVE SUMMARY');
    lines.push(report.executive_summary);
    lines.push('');
    report.sections.forEach(s => {
      lines.push(s.heading.toUpperCase());
      lines.push(s.body);
      lines.push('');
    });
    lines.push('KEY METRICS');
    Object.entries(report.key_metrics).forEach(([k, v]) => lines.push(`${k}: ${v}`));

    // If client requests PDF stream
    if (req.query.format === 'pdf') {
      const pdfContent = buildSimplePdf(lines);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="market-intel-${report.period}.pdf"`);
      return res.send(pdfContent);
    }

    res.json({ success: true, report, lines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function buildSimplePdf(lines) {
  const safeLines = lines.map(l => String(l).replace(/[()\\]/g, '\\$&'));
  let yPos = 780;
  const text = safeLines.map(l => {
    const s = `BT /F1 11 Tf 50 ${yPos} Td (${l}) Tj ET`;
    yPos -= 15;
    return s;
  }).join('\n');
  const content = text;
  const contentBytes = Buffer.byteLength(content, 'utf8');
  const objects = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n');
  objects.push(`4 0 obj\n<< /Length ${contentBytes} >>\nstream\n${content}\nendstream\nendobj\n`);
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach(obj => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  });
  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(o => {
    pdf += String(o).padStart(10, '0') + ' 00000 n \n';
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

// 4. NON-VIZ: Signal/Threshold Rules Editor (CRUD)
router.get('/signal-rules', (req, res) => {
  res.json({ success: true, count: signalRules.length, data: signalRules });
});

router.post('/signal-rules', (req, res) => {
  try {
    const { name, commodity, condition, threshold, action, enabled } = req.body || {};
    if (!name || !commodity || !condition || threshold === undefined) {
      return res.status(400).json({ error: 'name, commodity, condition, threshold required' });
    }
    const rule = {
      id: nextRuleId++,
      name,
      commodity,
      condition,
      threshold: Number(threshold),
      action: action || 'ALERT',
      enabled: enabled !== false,
      createdAt: new Date().toISOString(),
    };
    signalRules.push(rule);
    res.status(201).json({ success: true, data: rule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/signal-rules/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = signalRules.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
  signalRules[idx] = { ...signalRules[idx], ...req.body, id, updatedAt: new Date().toISOString() };
  res.json({ success: true, data: signalRules[idx] });
});

router.delete('/signal-rules/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const before = signalRules.length;
  signalRules = signalRules.filter(r => r.id !== id);
  if (signalRules.length === before) return res.status(404).json({ error: 'Rule not found' });
  res.json({ success: true, deleted: id });
});

module.exports = router;

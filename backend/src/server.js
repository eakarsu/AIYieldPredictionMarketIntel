const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Direct AI endpoints
app.use('/api/ai', require('./routes/ai'));
app.use('/api/custom', require('./routes/customFeatures'));

// Feature route imports
const routeMap = {
  'yield-predictions': 'yieldPredictions',
  'market-prices': 'marketPrices',
  'weather-analysis': 'weatherAnalysis',
  'soil-health': 'soilHealth',
  'crop-recommendations': 'cropRecommendations',
  'pest-alerts': 'pestAlerts',
  'irrigation-plans': 'irrigationPlans',
  'harvest-plans': 'harvestPlans',
  'market-trends': 'marketTrends',
  'supply-chain': 'supplyChain',
  'financial-plans': 'financialPlans',
  'satellite-data': 'satelliteData',
  'equipment': 'equipment',
  'labor-plans': 'laborPlans',
  'sustainability': 'sustainability',
};

Object.entries(routeMap).forEach(([path, routeFile]) => {
  try {
    const route = require(`./routes/${routeFile}`);
    app.use(`/api/${path}`, route);
  } catch (err) {
    console.warn(`Route file ./routes/${routeFile}.js not found: ${err.message}`);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Database sync and server start
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync({ alter: true });
    console.log('All models synchronized.');

// // === Batch 09 Gaps & Frontend Mounts ===
app.use('/api/gap-ai-aiyieldpredictionmarketintel', require('./routes/batch09GapAi')); // // === Batch 09 Gaps & Frontend Mounts ===
app.use('/api/gap-nonai-aiyieldpredictionmarketintel', require('./routes/batch09GapNonai')); // // === Batch 09 Gaps & Frontend Mounts ===

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

module.exports = app;



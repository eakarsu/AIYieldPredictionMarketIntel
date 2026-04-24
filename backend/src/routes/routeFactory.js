const express = require('express');
const { Op } = require('sequelize');
const { getAIAnalysis } = require('../services/openrouter');

function createRoutes(modelName, featureName) {
  const router = express.Router();

  // Helper to get string attributes from a model for search
  function getStringAttributes(Model) {
    const attrs = [];
    const rawAttrs = Model.rawAttributes || {};
    for (const [key, def] of Object.entries(rawAttrs)) {
      if (
        def.type &&
        (def.type.key === 'STRING' || def.type.key === 'TEXT')
      ) {
        attrs.push(key);
      }
    }
    return attrs;
  }

  // GET / - List all items (with optional search)
  router.get('/', async (req, res) => {
    try {
      const db = require('../models');
      const Model = db[modelName];

      if (!Model) {
        return res.status(500).json({ error: `Model ${modelName} not found` });
      }

      const { search } = req.query;
      let where = {};

      if (search) {
        const stringFields = getStringAttributes(Model);
        if (stringFields.length > 0) {
          where = {
            [Op.or]: stringFields.map(field => ({
              [field]: { [Op.like]: `%${search}%` }
            }))
          };
        }
      }

      const items = await Model.findAll({ where });
      res.json({ success: true, data: items, count: items.length });
    } catch (error) {
      console.error(`Error fetching ${featureName}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /:id - Get single item
  router.get('/:id', async (req, res) => {
    try {
      const db = require('../models');
      const Model = db[modelName];

      if (!Model) {
        return res.status(500).json({ error: `Model ${modelName} not found` });
      }

      const item = await Model.findByPk(req.params.id);

      if (!item) {
        return res.status(404).json({ error: `${featureName} not found` });
      }

      res.json({ success: true, data: item });
    } catch (error) {
      console.error(`Error fetching ${featureName}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST / - Create new item
  router.post('/', async (req, res) => {
    try {
      const db = require('../models');
      const Model = db[modelName];

      if (!Model) {
        return res.status(500).json({ error: `Model ${modelName} not found` });
      }

      const item = await Model.create(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      console.error(`Error creating ${featureName}:`, error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(e => e.message)
        });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /:id - Update item
  router.put('/:id', async (req, res) => {
    try {
      const db = require('../models');
      const Model = db[modelName];

      if (!Model) {
        return res.status(500).json({ error: `Model ${modelName} not found` });
      }

      const item = await Model.findByPk(req.params.id);

      if (!item) {
        return res.status(404).json({ error: `${featureName} not found` });
      }

      await item.update(req.body);
      res.json({ success: true, data: item });
    } catch (error) {
      console.error(`Error updating ${featureName}:`, error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(e => e.message)
        });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /:id - Delete item
  router.delete('/:id', async (req, res) => {
    try {
      const db = require('../models');
      const Model = db[modelName];

      if (!Model) {
        return res.status(500).json({ error: `Model ${modelName} not found` });
      }

      const item = await Model.findByPk(req.params.id);

      if (!item) {
        return res.status(404).json({ error: `${featureName} not found` });
      }

      await item.destroy();
      res.json({ success: true, message: `${featureName} deleted successfully` });
    } catch (error) {
      console.error(`Error deleting ${featureName}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /:id/analyze - AI analysis
  router.post('/:id/analyze', async (req, res) => {
    try {
      const db = require('../models');
      const Model = db[modelName];

      if (!Model) {
        return res.status(500).json({ error: `Model ${modelName} not found` });
      }

      const item = await Model.findByPk(req.params.id);

      if (!item) {
        return res.status(404).json({ error: `${featureName} not found` });
      }

      const analysis = await getAIAnalysis(featureName, item.toJSON());
      res.json({ success: true, data: { item, analysis } });
    } catch (error) {
      console.error(`Error analyzing ${featureName}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}

module.exports = createRoutes;

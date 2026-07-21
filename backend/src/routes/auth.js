const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { AuthUser } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await AuthUser.findOne({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await AuthUser.findByPk(req.user.id, { attributes: ['id','email','name','role'] });
  if (!user) return res.status(401).json({ error: 'Session user no longer exists' });
  res.json(user);
});

// POST /register - for future use
router.post('/register', async (req, res) => {
  return res.status(501).json({ error: 'REGISTRATION_DISABLED' });
});

module.exports = router;

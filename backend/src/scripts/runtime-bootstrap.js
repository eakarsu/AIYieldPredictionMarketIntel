'use strict';

const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const { sequelize, AuthUser } = require('../models');

async function main() {
  const directory = path.join(__dirname, '..', '..', 'migrations');
  for (const name of fs.readdirSync(directory).filter((entry) => entry.endsWith('.sql')).sort()) {
    await sequelize.query(fs.readFileSync(path.join(directory, name), 'utf8'));
    console.log(`Reconciled ${name}`);
  }
  await sequelize.sync();

  if (process.env.BOOTSTRAP_ACKNOWLEDGEMENT !== 'create-initial-admin') {
    throw new Error('BOOTSTRAP_ACKNOWLEDGEMENT=create-initial-admin is required');
  }
  const email = String(process.env.PROVISION_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.PROVISION_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '');
  const name = String(process.env.PROVISION_ADMIN_NAME || 'Yield Market Administrator').trim();
  if (!email.includes('@') || password.length < 12 || !name) throw new Error('Valid administrator credentials are required');
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await AuthUser.findOne({ where: { email } });
  if (existing) await existing.update({ password_hash: passwordHash, name, role: 'admin' });
  else await AuthUser.create({ email, password_hash: passwordHash, name, role: 'admin' });
  console.log(`Provisioned yield market administrator ${email}`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => sequelize.close());

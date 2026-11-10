const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
const envPath = path.resolve(__dirname, '..', envFile);
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database for The House of Aatmiya');

    await client.query('BEGIN');
    const bcrypt = require('bcryptjs');

    // 1. Seed Store Settings (Multi-mode config + WhatsApp & UPI details)
    await client.query(`
      INSERT INTO "store_settings" ("id", "default_mode", "allow_mode_switching", "next_food_batch_label", "whatsapp_phone", "upi_vpa")
      VALUES ('default', 'ALL', true, 'Next Fresh Batch: Friday (Orders close Wednesday)', '919876543210', 'aatmiya@okaxis')
      ON CONFLICT ("id") DO UPDATE
      SET "updated_at" = CURRENT_TIMESTAMP;
    `);
    console.log('Default store_settings seeded.');

    // 2. Seed Arun (SUPER_ADMIN) and Snehal (ADMIN)
    const arunHash = await bcrypt.hash('Aatmiya@Arun2026!', 10);
    const snehalHash = await bcrypt.hash('Aatmiya@Snehal2026!', 10);

    const insertAdminQuery = `
      INSERT INTO "admins" ("email", "password_hash", "role", "name", "phone")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("email") DO UPDATE
      SET "name" = EXCLUDED."name", "phone" = EXCLUDED."phone", "updated_at" = CURRENT_TIMESTAMP;
    `;

    await client.query(insertAdminQuery, [
      'arun@houseofaatmiya.in',
      arunHash,
      'SUPER_ADMIN',
      'Arun (Co-Founder)',
      '9876543210',
    ]);
    console.log('Super Admin (arun@houseofaatmiya.in) seeded.');

    await client.query(insertAdminQuery, [
      'snehal@houseofaatmiya.in',
      snehalHash,
      'ADMIN',
      'Snehal (Founder & Creator)',
      '9876543211',
    ]);
    console.log('Founder Admin (snehal@houseofaatmiya.in) seeded.');

    await client.query('COMMIT');
  } catch (err) {
    console.error('Error executing seed script:', err);
    await client.query('ROLLBACK');
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

seed();

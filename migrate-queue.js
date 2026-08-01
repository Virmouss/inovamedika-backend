/**
 * Migration: Add queue_number column and expand status_kunjungan constraint
 * Run with: node migrate-queue.js
 */
const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
    });

    try {
        await client.connect();
        console.log('Connected to database. Running migration...');

        // 1. Add queue_number column (safe if already exists)
        await client.query(`
            ALTER TABLE APPOINTMENTS 
            ADD COLUMN IF NOT EXISTS queue_number VARCHAR(10) NULL;
        `);
        console.log('✔ Added queue_number column');

        // 2. Drop existing constraint on status_kunjungan, then add new one with 'assessing'
        // PostgreSQL doesn't support ALTER on CHECK constraints directly, so we drop and recreate.
        await client.query(`
            ALTER TABLE APPOINTMENTS
            DROP CONSTRAINT IF EXISTS appointments_status_kunjungan_check;
        `);
        await client.query(`
            ALTER TABLE APPOINTMENTS
            ADD CONSTRAINT appointments_status_kunjungan_check
            CHECK (status_kunjungan IN ('waiting', 'called', 'assessing', 'done', 'cancelled'));
        `);
        console.log('✔ Updated status_kunjungan check constraint to include "assessing"');

        console.log('\n✅ Migration complete!');
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();

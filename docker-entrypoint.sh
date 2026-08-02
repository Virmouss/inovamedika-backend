#!/bin/sh
set -e

echo "----------------------------------------"
echo "Starting Inovamedika Backend Container"
echo "----------------------------------------"

echo "Waiting for PostgreSQL database connection..."
node -e "
const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: 'postgres'
});

async function waitForDb() {
  for (let i = 0; i < 30; i++) {
    try {
      await client.connect();
      console.log('✔ PostgreSQL server connection verified.');
      await client.end();
      process.exit(0);
    } catch (e) {
      console.log('Waiting for database (' + (i + 1) + '/30)...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.error('Could not connect to PostgreSQL within 60 seconds.');
  process.exit(1);
}
waitForDb();
"

echo "Initializing database schema..."
node init-db.js

if [ "$SEED_DATA" = "true" ]; then
  echo "SEED_DATA is set to true. Seeding initial dummy records..."
  node seed-dummy-data.js || echo "Seeding completed or records already exist."
fi

echo "Starting Express API Server..."
exec "$@"

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDb() {
    let host = process.env.DB_HOST;
    if (host === 'root') {
        console.warn("WARNING: DB_HOST is set to 'root', assuming 'localhost'");
        host = 'localhost';
    }

    const dbName = process.env.DB_NAME;

    // Connect to default 'postgres' database to create the new one
    const client = new Client({
        host: host,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
        database: 'postgres'
    });

    try {
        await client.connect();
        console.log("Connected to PostgreSQL server.");
        
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
        if (res.rowCount === 0) {
            console.log(`Creating database ${dbName}...`);
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`Database ${dbName} created successfully.`);
        } else {
            console.log(`Database ${dbName} already exists.`);
        }
    } catch (err) {
        console.error("Error creating database:", err);
        process.exit(1);
    } finally {
        await client.end();
    }

    // Now connect to the new database and run schema.sql
    const targetClient = new Client({
        host: host,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
        database: dbName
    });

    try {
        await targetClient.connect();
        console.log(`Connected to database ${dbName}.`);
        
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        console.log("Running schema.sql...");
        await targetClient.query(schemaSql);
        console.log("Schema initialized successfully.");
    } catch (err) {
        console.error("Error executing schema:", err);
    } finally {
        await targetClient.end();
    }
}

initDb();

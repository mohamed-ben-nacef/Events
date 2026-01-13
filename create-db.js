
const { Client } = require('pg');

const config = {
    user: 'postgres',
    password: '123456',
    host: '127.0.0.1',
    port: 5432,
    database: 'postgres', // Connect to default database
};

const client = new Client(config);

async function createDatabase() {
    try {
        await client.connect();
        // Check if database exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'audiovisual_db'");
        if (res.rowCount === 0) {
            await client.query('CREATE DATABASE audiovisual_db');
            console.log('Database "audiovisual_db" created successfully.');
        } else {
            console.log('Database "audiovisual_db" already exists.');
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
}

createDatabase();

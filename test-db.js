const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

client.connect()
  .then(() => {
    console.log('✅ Connected to PostgreSQL successfully!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Current DB Time:', res.rows[0].now);
    client.end();
  })
  .catch(err => {
    console.error('❌ Connection failed:', err);
    client.end();
  });

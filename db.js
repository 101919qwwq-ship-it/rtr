const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Copy .env.example -> .env and set DATABASE_URL");
  process.exit(1);
}
const useSSL = process.env.NODE_ENV === 'production';
const pool = new Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : false
});
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};

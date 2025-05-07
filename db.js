const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost', // o el host de tu BD
  database: 'siscnmma_db',
  password: 'Abcd2025',
  port: 5432
});

module.exports = pool;

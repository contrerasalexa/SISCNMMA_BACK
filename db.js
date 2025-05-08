const { Pool } = require('pg');
require('dotenv').config(); // Importa las variables del archivo .env

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10)
});
console.log("Entorno cargado:", process.env.DB_HOST, process.env.DB_USER);

module.exports = pool;

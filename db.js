const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',         // tu usuario de PostgreSQL
  host: 'localhost',
  database: 'react_express_db', // nombre de tu base de datos
  password: 'Galindo2',   // tu contraseña
  port: 5432,
});

module.exports = pool;
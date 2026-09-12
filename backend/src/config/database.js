const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'bibliotheque',
  user:     process.env.DB_USER     || 'user',
  password: process.env.DB_PASSWORD || 'password',
});

pool.query('SELECT NOW()')
  .then(() => console.log('✅  PostgreSQL connecté'))
  .catch(err => console.error('❌  Connexion PostgreSQL échouée :', err.message));

module.exports = pool;

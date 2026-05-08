require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tfm_unir',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Prueba de conexión
pool.getConnection()
  .then(connection => {
    console.log('✓ Conectado a MySQL correctamente');
    connection.release();
  })
  .catch(err => {
    console.error('✗ Error conectando a MySQL:', err.message);
    console.error('  Asegúrate de que:');
    console.error('  1. MySQL está corriendo');
    console.error('  2. Las credenciales en .env son correctas');
    console.error('  3. La BD "' + process.env.DB_NAME + '" existe');
  });

module.exports = pool;

const path = require('path');
require('dotenv').config();

const requiredInProduction = ['JWT_SECRET'];

requiredInProduction.forEach((key) => {
  if (process.env.NODE_ENV === 'production' && !process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const toList = (value, fallback = '') => (value || fallback)
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3001,
  simulationRoot: process.env.SIMULATION_ROOT || '/home/psmolina/TFM-SIMULATION',
  currentProject: process.env.CURRENT_PROJECT || path.join(process.env.SIMULATION_ROOT || '/home/psmolina/TFM-SIMULATION', 'project'),
  jwtSecret: process.env.JWT_SECRET || 'dev_insecure_secret_change_me',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  corsOrigins: toList(process.env.CORS_ORIGINS, 'http://localhost:3000'),
  socketCorsOrigins: toList(process.env.SOCKET_CORS_ORIGINS, process.env.CORS_ORIGINS || 'http://localhost:3000'),
  commandTimeoutMs: Number(process.env.COMMAND_TIMEOUT_MS) || 120000,
  commandMaxBufferBytes: Number(process.env.COMMAND_MAX_BUFFER_BYTES) || 1024 * 1024,
  statusPollIntervalMs: Number(process.env.STATUS_POLL_INTERVAL_MS) || 3000,
};

module.exports = config;

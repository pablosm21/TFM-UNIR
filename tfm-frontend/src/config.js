const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  socketUrl: process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  statusPollIntervalMs: Number(process.env.REACT_APP_STATUS_POLL_INTERVAL_MS) || 3000,
};

export default config;

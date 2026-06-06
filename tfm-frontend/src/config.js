const hasEnvVar = (name) => Object.prototype.hasOwnProperty.call(process.env, name);

const apiBaseUrl = hasEnvVar('REACT_APP_API_BASE_URL')
  ? process.env.REACT_APP_API_BASE_URL
  : 'http://localhost:3001';

const socketUrl = hasEnvVar('REACT_APP_SOCKET_URL')
  ? process.env.REACT_APP_SOCKET_URL
  : (hasEnvVar('REACT_APP_API_BASE_URL') ? process.env.REACT_APP_API_BASE_URL : 'http://localhost:3001');

const config = {
  apiBaseUrl,
  socketUrl,
  statusPollIntervalMs: Number(process.env.REACT_APP_STATUS_POLL_INTERVAL_MS) || 3000,
};

export default config;

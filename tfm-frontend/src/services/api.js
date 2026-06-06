import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let tokenGetter = null;
let unauthorizedHandler = null;

export const configureApiAuth = ({ getToken, onUnauthorized }) => {
  tokenGetter = getToken;
  unauthorizedHandler = onUnauthorized;
};

api.interceptors.request.use((requestConfig) => {
  const token = tokenGetter ? tokenGetter() : null;
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:8000`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach Bearer token to every request if it exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

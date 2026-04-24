import axios from 'axios';

const api = axios.create({
  // baseURL: (import.meta.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api',
  baseURL: (import.meta.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || 'https://skillsconnect-0qu6.onrender.com/') + '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

import axios from 'axios';

// ✅ URL correcta según el entorno
const API_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000/api'
  : 'https://qztpmddggqdmaykelcpz.supabase.co'; // Usar Supabase directamente

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token de prueba
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NTY1ZWRiLTZiNWMtNGQ4NC1iM2U3LTE1MTA3YWZmZDNjMCIsInVzZXJuYW1lIjoianVjYTc2MDMiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODUyOTA5MTAsImV4cCI6MTc4NTg5NTcxMH0.Tnp3zIEGvBxRNN0oDyMojePXeGDjmEgW9oiPHm20Oaw';

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || TEST_TOKEN;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;

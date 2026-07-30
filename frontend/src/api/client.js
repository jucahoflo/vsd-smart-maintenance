import { supabase } from '../config/supabase';

// Usar Supabase directamente
const API_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000/api'
  : null;

// Obtener token de autenticación
const getToken = async () => {
  const token = localStorage.getItem('token');
  if (token) return token;
  
  // Si no hay token, intentar obtener sesión de Supabase
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    localStorage.setItem('token', session.access_token);
    return session.access_token;
  }
  return null;
};

const api = {
  get: async (url) => {
    const token = await getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    if (API_URL) {
      const axios = (await import('axios')).default;
      return axios.get(`${API_URL}${url}`, { headers });
    }
    
    // Producción: usar Supabase
    const table = url.split('/').filter(Boolean)[0];
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .headers(headers);
    if (error) throw error;
    return { data: { data } };
  },
  
  post: async (url, body) => {
    const token = await getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    if (API_URL) {
      const axios = (await import('axios')).default;
      return axios.post(`${API_URL}${url}`, body, { headers });
    }
    
    const table = url.split('/').filter(Boolean)[0];
    const { data, error } = await supabase
      .from(table)
      .insert([body])
      .select()
      .headers(headers);
    if (error) throw error;
    return { data: { data: data[0] } };
  },
  
  put: async (url, body) => {
    const token = await getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    if (API_URL) {
      const axios = (await import('axios')).default;
      return axios.put(`${API_URL}${url}`, body, { headers });
    }
    
    const parts = url.split('/').filter(Boolean);
    const table = parts[0];
    const id = parts[1];
    const { data, error } = await supabase
      .from(table)
      .update(body)
      .eq('id', id)
      .select()
      .headers(headers);
    if (error) throw error;
    return { data: { data: data[0] } };
  },
  
  delete: async (url) => {
    const token = await getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    if (API_URL) {
      const axios = (await import('axios')).default;
      return axios.delete(`${API_URL}${url}`, { headers });
    }
    
    const parts = url.split('/').filter(Boolean);
    const table = parts[0];
    const id = parts[1];
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .headers(headers);
    if (error) throw error;
    return { data: { success: true } };
  }
};

export default api;

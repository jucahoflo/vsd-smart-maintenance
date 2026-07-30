import { supabase } from '../config/supabase';
import axios from 'axios';

// Usar Supabase directamente
const API_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000/api'
  : null;

// Obtener token de autenticación
const getToken = async () => {
  const token = localStorage.getItem('token');
  if (token) return token;
  
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    localStorage.setItem('token', session.access_token);
    return session.access_token;
  }
  return null;
};

// Configuración de Supabase con autenticación
const supabaseWithAuth = async () => {
  const token = await getToken();
  return supabase;
};

const api = {
  get: async (url) => {
    const token = await getToken();
    
    if (API_URL) {
      // Desarrollo: usar axios
      const response = await axios.get(`${API_URL}${url}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      return { data: response.data };
    }
    
    // Producción: usar Supabase
    const table = url.split('/').filter(Boolean)[0];
    let query = supabase.from(table).select('*');
    
    // Si hay filtros en la URL (ej: ?status=eq.active)
    const queryParams = url.split('?')[1];
    if (queryParams) {
      const params = new URLSearchParams(queryParams);
      for (const [key, value] of params) {
        if (key.includes('eq.')) {
          const field = key.split('.')[0];
          const val = value;
          query = query.eq(field, val);
        }
      }
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data: { data } };
  },
  
  post: async (url, body) => {
    const token = await getToken();
    
    if (API_URL) {
      const response = await axios.post(`${API_URL}${url}`, body, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      return { data: response.data };
    }
    
    const table = url.split('/').filter(Boolean)[0];
    const { data, error } = await supabase
      .from(table)
      .insert([body])
      .select();
    if (error) throw error;
    return { data: { data: data[0] } };
  },
  
  put: async (url, body) => {
    const token = await getToken();
    
    if (API_URL) {
      const response = await axios.put(`${API_URL}${url}`, body, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      return { data: response.data };
    }
    
    const parts = url.split('/').filter(Boolean);
    const table = parts[0];
    const id = parts[1];
    const { data, error } = await supabase
      .from(table)
      .update(body)
      .eq('id', id)
      .select();
    if (error) throw error;
    return { data: { data: data[0] } };
  },
  
  delete: async (url) => {
    const token = await getToken();
    
    if (API_URL) {
      const response = await axios.delete(`${API_URL}${url}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      return { data: response.data };
    }
    
    const parts = url.split('/').filter(Boolean);
    const table = parts[0];
    const id = parts[1];
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { data: { success: true } };
  }
};

export default api;

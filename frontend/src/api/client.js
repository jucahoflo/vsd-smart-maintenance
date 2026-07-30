import { supabase } from '../config/supabase';

// Usar Supabase directamente
const API_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000/api'
  : null; // En producción usamos Supabase directamente

const api = {
  get: async (url) => {
    if (API_URL) {
      // Desarrollo: usar axios local
      const axios = (await import('axios')).default;
      return axios.get(`${API_URL}${url}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
    }
    // Producción: usar Supabase
    const table = url.split('/').filter(Boolean)[0];
    const { data, error } = await supabase
      .from(table)
      .select('*');
    if (error) throw error;
    return { data: { data } };
  },
  post: async (url, body) => {
    if (API_URL) {
      const axios = (await import('axios')).default;
      return axios.post(`${API_URL}${url}`, body, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
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
    if (API_URL) {
      const axios = (await import('axios')).default;
      return axios.put(`${API_URL}${url}`, body, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
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
    if (API_URL) {
      const axios = (await import('axios')).default;
      return axios.delete(`${API_URL}${url}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
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

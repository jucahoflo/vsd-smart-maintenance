import api from './client';

export const vfds = {
  getAll: () => api.get('/vfds'),
  getById: (id) => api.get(`/vfds/${id}`),
  create: (data) => api.post('/vfds', data),
  update: (id, data) => api.put(`/vfds/${id}`, data),
  delete: (id) => api.delete(`/vfds/${id}`)
};

export const maintenance = {
  getAll: () => api.get('/maintenance_records'),
  create: (data) => api.post('/maintenance_records', data),
  update: (id, data) => api.put(`/maintenance_records/${id}`, data),
  delete: (id) => api.delete(`/maintenance_records/${id}`)
};

export const alerts = {
  getActive: () => api.get('/alerts?status=eq.active'),
  create: (data) => api.post('/alerts', data)
};

export const inventory = {
  getAll: () => api.get('/inventory'),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`)
};

import api from './client';

// ===========================
// AUTH
// ===========================
export const auth = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  profile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout')
};

// ===========================
// VFDs
// ===========================
export const vfds = {
  getAll: () => api.get('/vfds'),
  getById: (id) => api.get(`/vfds/${id}`),
  create: (data) => api.post('/vfds', data),
  update: (id, data) => api.put(`/vfds/${id}`, data),
  delete: (id) => api.delete(`/vfds/${id}`),
  getTelemetry: (id, limit = 100) => api.get(`/vfds/${id}/telemetry?limit=${limit}`),
  getMaintenance: (id) => api.get(`/vfds/${id}/maintenance`),
  getAlerts: (id) => api.get(`/vfds/${id}/alerts`),
  getImages: (id) => api.get(`/upload/image/${id}`)
};

// ===========================
// MAINTENANCE (solo una vez)
// ===========================
export const maintenance = {
  getAll: () => api.get('/maintenance'),
  getStats: () => api.get('/maintenance/stats'),
  getById: (id) => api.get(`/maintenance/${id}`),
  getByVFD: (vfdId) => api.get(`/maintenance/vfd/${vfdId}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  complete: (id, data) => api.put(`/maintenance/${id}/complete`, data),
  delete: (id) => api.delete(`/maintenance/${id}`)
};

// ===========================
// ALERTS
// ===========================
export const alerts = {
  getAll: () => api.get('/alerts'),
  getActive: () => api.get('/alerts/active'),
  getByVFD: (vfdId) => api.get(`/alerts/vfd/${vfdId}`),
  create: (data) => api.post('/alerts', data),
  acknowledge: (id) => api.put(`/alerts/${id}/acknowledge`),
  resolve: (id) => api.put(`/alerts/${id}/resolve`)
};

// ===========================
// TELEMETRY
// ===========================
export const telemetry = {
  getByVFD: (vfdId, limit = 100) => api.get(`/telemetry/vfd/${vfdId}?limit=${limit}`),
  getLatest: (vfdId) => api.get(`/telemetry/vfd/${vfdId}/latest`),
  create: (data) => api.post('/telemetry', data)
};

// ===========================
// INVENTORY
// ===========================
export const inventory = {
  getAll: () => api.get('/inventory'),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`)
};

// ===========================
// UPLOAD
// ===========================
export const upload = {
  saveImage: (data) => api.post('/upload/image', data),
  deleteImage: (data) => api.delete('/upload/image', { data }),
  getImages: (vfdId) => api.get(`/upload/image/${vfdId}`)
};

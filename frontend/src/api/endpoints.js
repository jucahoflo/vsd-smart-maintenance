import api from './client';

// ===========================
// VFDs
// ===========================
export const vfds = {
  getAll: () => api.get('/vfds'),
  getById: (id) => api.get(`/vfds/${id}`),
  create: (data) => api.post('/vfds', data),
  update: (id, data) => api.put(`/vfds/${id}`, data),
  delete: (id) => api.delete(`/vfds/${id}`)
};

// ===========================
// MANTENIMIENTO
// ===========================
export const maintenance = {
  getAll: () => api.get('/maintenance_records'),
  getByCodigo: (codigo) => api.get(`/maintenance_records?vfd_codigo=eq.${codigo}`),
  getByFecha: (fechaInicio, fechaFin) => api.get(`/maintenance_records?fecha_registro=gte.${fechaInicio}&fecha_registro=lte.${fechaFin}`),
  create: (data) => api.post('/maintenance_records', data),
  update: (id, data) => api.put(`/maintenance_records/${id}`, data),
  delete: (id) => api.delete(`/maintenance_records/${id}`),
  complete: (id, data) => api.put(`/maintenance_records/${id}`, data)
};

// ===========================
// INVENTARIO
// ===========================
export const inventory = {
  getAll: () => api.get('/inventory'),
  getByCodigo: (codigo) => api.get(`/inventory?vfd_codigo=eq.${codigo}`),
  getByFecha: (fechaInicio, fechaFin) => api.get(`/inventory?fecha_registro=gte.${fechaInicio}&fecha_registro=lte.${fechaFin}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`)
};

// ===========================
// ALERTAS
// ===========================
export const alerts = {
  getActive: () => api.get('/alerts?status=eq.active'),
  create: (data) => api.post('/alerts', data)
};

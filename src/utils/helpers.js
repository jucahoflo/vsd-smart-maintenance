export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (estado) => {
  const colors = {
    activo: '#22c55e',
    mantenimiento: '#eab308',
    inactivo: '#ef4444',
    pendiente: '#eab308',
    en_progreso: '#3b82f6',
    completado: '#22c55e',
    cancelado: '#6b7280'
  };
  return colors[estado] || '#6b7280';
};

export const getStatusLabel = (estado) => {
  const labels = {
    activo: 'Activo',
    mantenimiento: 'En Mantenimiento',
    inactivo: 'Inactivo',
    pendiente: 'Pendiente',
    en_progreso: 'En Progreso',
    completado: 'Completado',
    cancelado: 'Cancelado'
  };
  return labels[estado] || estado;
};

export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};
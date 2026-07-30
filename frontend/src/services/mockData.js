// Datos de ejemplo para desarrollo
export const mockVFDs = [
  { 
    id: '1', 
    equipment_id: 'VFD-001', 
    manufacturer: 'ABB', 
    model: 'ACS880-01-032A-3', 
    status: 'online', 
    power_rating: 15, 
    voltage_rating: 400,
    kva: 18.5,
    site: 'Planta Norte',
    department: 'Línea 1',
    health_score: 95,
    current_frequency: 45.2,
    current_temperature: 42.3,
    current_power: 7.8,
    image_url1: 'https://via.placeholder.com/400x300/6C63FF/FFFFFF?text=VFD-001',
    image_url2: 'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Instalacion',
    notes: 'Mantenimiento preventivo cada 6 meses'
  },
  { 
    id: '2', 
    equipment_id: 'VFD-002', 
    manufacturer: 'Siemens', 
    model: 'SINAMICS G120', 
    status: 'online', 
    power_rating: 7.5, 
    voltage_rating: 400,
    kva: 9.2,
    site: 'Planta Norte',
    department: 'Línea 2',
    health_score: 88,
    current_frequency: 48.1,
    current_temperature: 38.5,
    current_power: 5.2,
    image_url1: 'https://via.placeholder.com/400x300/1a237e/FFFFFF?text=VFD-002',
    notes: 'Instalado en 2024'
  },
  { 
    id: '3', 
    equipment_id: 'VFD-003', 
    manufacturer: 'Danfoss', 
    model: 'VLT FC-302', 
    status: 'alarm', 
    power_rating: 22, 
    voltage_rating: 400,
    kva: 27.5,
    site: 'Planta Sur',
    department: 'Compresor',
    health_score: 65,
    current_frequency: 52.3,
    current_temperature: 58.7,
    current_power: 12.4,
    image_url1: 'https://via.placeholder.com/400x300/FDCB6E/333333?text=VFD-003',
    notes: '⚠️ Revisar temperatura'
  },
  { 
    id: '4', 
    equipment_id: 'VFD-004', 
    manufacturer: 'Schneider', 
    model: 'Altivar 71', 
    status: 'offline', 
    power_rating: 11, 
    voltage_rating: 400,
    kva: 13.8,
    site: 'Planta Sur',
    department: 'Bomba',
    health_score: 45,
    current_frequency: 0,
    current_temperature: 22.0,
    current_power: 0,
    image_url1: 'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=VFD-004',
    notes: 'Fuera de servicio - esperando repuesto'
  },
  { 
    id: '5', 
    equipment_id: 'VFD-005', 
    manufacturer: 'Yaskawa', 
    model: 'GA500', 
    status: 'online', 
    power_rating: 30, 
    voltage_rating: 400,
    kva: 37.5,
    site: 'Planta Este',
    department: 'Robot',
    health_score: 92,
    current_frequency: 42.8,
    current_temperature: 40.1,
    current_power: 18.5,
    image_url1: 'https://via.placeholder.com/400x300/00B894/FFFFFF?text=VFD-005',
    image_url2: 'https://via.placeholder.com/400x300/74B9FF/FFFFFF?text=Robot',
    notes: 'VFD principal del robot'
  },
  { 
    id: '6', 
    equipment_id: 'VFD-006', 
    manufacturer: 'ABB', 
    model: 'ACS580-01-039A-4', 
    status: 'online', 
    power_rating: 18.5, 
    voltage_rating: 400,
    kva: 22.8,
    site: 'Planta Norte',
    department: 'Línea 3',
    health_score: 100,
    current_frequency: 45.2,
    current_temperature: 35.0,
    current_power: 9.8,
    image_url1: 'https://via.placeholder.com/400x300/8B83FF/FFFFFF?text=VFD-006',
    image_url2: 'https://via.placeholder.com/400x300/55EFC4/333333?text=Linea3',
    notes: 'Nuevo equipo - garantía extendida'
  }
];

export const mockAlerts = [
  { 
    id: '1', 
    vfd_id: '3', 
    message: 'Temperatura crítica: 58.7°C', 
    severity: 'critical', 
    status: 'active',
    created_at: new Date().toISOString()
  }
];

export const mockMaintenance = [
  { id: '1', vfd_id: '1', type: 'preventive', status: 'completed', scheduled_date: '2026-07-15' },
  { id: '2', vfd_id: '2', type: 'corrective', status: 'pending', scheduled_date: '2026-08-01' },
  { id: '3', vfd_id: '3', type: 'emergency', status: 'pending', scheduled_date: '2026-07-28' }
];

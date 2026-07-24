import { dbService } from '../services/indexedDBService';
import { v4 as uuidv4 } from 'uuid';

export const seedData = async () => {
  try {
    console.log('🌱 Iniciando carga de datos de prueba...');
    
    // Verificar si ya hay datos
    const existingVsds = await dbService.getAll('vsds');
    console.log(`📊 VSDs existentes: ${existingVsds.length}`);
    
    if (existingVsds.length > 0) {
      console.log('✅ Los datos de prueba ya existen, no se cargarán duplicados');
      return;
    }

    console.log('📝 Creando datos de prueba...');

    // VSDs de ejemplo
    const vsds = [
      {
        _id: uuidv4(),
        nombre: 'VSD-001 - Bomba Principal',
        serie: 'SN-2024-001',
        ubicacion: 'Planta Norte - Sala 1',
        marca: 'Siemens',
        modelo: 'G120',
        potencia: '22 kW',
        voltage: '400 V',
        corriente: '45 A',
        frecuencia: '50/60 Hz',
        estado: 'activo',
        fechaInstalacion: '2024-01-15',
        horasOperacion: 8760,
        documentos: { planos: [], imagenes: [], manuales: [] },
        mantenimientos: [],
        partes: [],
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      },
      {
        _id: uuidv4(),
        nombre: 'VSD-002 - Compresor Aire',
        serie: 'SN-2024-002',
        ubicacion: 'Planta Sur - Taller',
        marca: 'ABB',
        modelo: 'ACS580',
        potencia: '45 kW',
        voltage: '440 V',
        corriente: '85 A',
        frecuencia: '50 Hz',
        estado: 'mantenimiento',
        fechaInstalacion: '2024-03-20',
        horasOperacion: 4320,
        documentos: { planos: [], imagenes: [], manuales: [] },
        mantenimientos: [],
        partes: [],
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      },
      {
        _id: uuidv4(),
        nombre: 'VSD-003 - Cinta Transportadora',
        serie: 'SN-2024-003',
        ubicacion: 'Planta Este - Producción',
        marca: 'Danfoss',
        modelo: 'FC-302',
        potencia: '15 kW',
        voltage: '380 V',
        corriente: '28 A',
        frecuencia: '60 Hz',
        estado: 'activo',
        fechaInstalacion: '2024-06-10',
        horasOperacion: 2400,
        documentos: { planos: [], imagenes: [], manuales: [] },
        mantenimientos: [],
        partes: [],
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      },
      {
        _id: uuidv4(),
        nombre: 'VSD-004 - Ventilador Extracto',
        serie: 'SN-2024-004',
        ubicacion: 'Planta Oeste - Ventilación',
        marca: 'Schneider Electric',
        modelo: 'ATV320',
        potencia: '7.5 kW',
        voltage: '400 V',
        corriente: '15 A',
        frecuencia: '50 Hz',
        estado: 'inactivo',
        fechaInstalacion: '2023-12-01',
        horasOperacion: 12500,
        documentos: { planos: [], imagenes: [], manuales: [] },
        mantenimientos: [],
        partes: [],
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      }
    ];

    console.log(`💾 Guardando ${vsds.length} VSDs...`);
    for (const vsd of vsds) {
      await dbService.save('vsds', vsd);
    }

    // Mantenimientos de ejemplo
    const maintenances = [
      {
        _id: uuidv4(),
        vsdId: vsds[0]._id,
        tipo: 'preventivo',
        titulo: 'Mantenimiento Preventivo - Bomba Principal',
        descripcion: 'Revisión general, limpieza de ventiladores, verificación de conexiones',
        fechaProgramada: '2026-08-15',
        fechaCreacion: new Date().toISOString(),
        prioridad: 'media',
        estado: 'pendiente',
        tecnico: 'Ing. Carlos Rodríguez',
        costo: 350,
        duracion: 4,
        observaciones: 'Programar con anticipación para no detener producción'
      },
      {
        _id: uuidv4(),
        vsdId: vsds[0]._id,
        tipo: 'correctivo',
        titulo: 'Reparación de IGBT - Bomba Principal',
        descripcion: 'Falla en módulo IGBT, se requiere reemplazo',
        fechaProgramada: '2026-07-10',
        fechaCreacion: new Date().toISOString(),
        prioridad: 'alta',
        estado: 'completado',
        tecnico: 'Ing. María Sánchez',
        costo: 1200,
        duracion: 8,
        observaciones: 'Se reemplazó módulo IGBT completo'
      },
      {
        _id: uuidv4(),
        vsdId: vsds[1]._id,
        tipo: 'predictivo',
        titulo: 'Análisis de Vibración - Compresor',
        descripcion: 'Medición de vibraciones para detección temprana de fallas',
        fechaProgramada: '2026-08-20',
        fechaCreacion: new Date().toISOString(),
        prioridad: 'media',
        estado: 'pendiente',
        tecnico: 'Ing. Juan Pérez',
        costo: 450,
        duracion: 3,
        observaciones: 'Usar equipo de análisis de vibraciones'
      }
    ];

    console.log(`💾 Guardando ${maintenances.length} mantenimientos...`);
    for (const m of maintenances) {
      await dbService.save('maintenances', m);
    }

    // Partes de ejemplo
    const parts = [
      {
        _id: uuidv4(),
        vsdId: vsds[0]._id,
        nombre: 'Módulo IGBT',
        codigo: 'IGBT-200A-1200V',
        descripcion: 'Módulo IGBT de 200A 1200V para Siemens G120',
        categoria: 'electrónica',
        cantidad: 3,
        ubicacion: 'Estante A2',
        proveedor: 'Siemens Industrial',
        precio: 450,
        fechaRegistro: new Date().toISOString()
      },
      {
        _id: uuidv4(),
        vsdId: vsds[0]._id,
        nombre: 'Ventilador de Refrigeración',
        codigo: 'FAN-120-24V',
        descripcion: 'Ventilador de 120mm 24V para VSD',
        categoria: 'refrigeración',
        cantidad: 5,
        ubicacion: 'Estante B3',
        proveedor: 'ElectroFan',
        precio: 85,
        fechaRegistro: new Date().toISOString()
      },
      {
        _id: uuidv4(),
        vsdId: vsds[1]._id,
        nombre: 'Capacitor Electrolítico',
        codigo: 'CAP-4700uF-450V',
        descripcion: 'Capacitor de 4700uF 450V para ABB ACS580',
        categoria: 'electrónica',
        cantidad: 8,
        ubicacion: 'Estante A1',
        proveedor: 'ABB Supply',
        precio: 120,
        fechaRegistro: new Date().toISOString()
      }
    ];

    console.log(`💾 Guardando ${parts.length} partes...`);
    for (const p of parts) {
      await dbService.save('parts', p);
    }

    console.log('✅ Datos de prueba creados exitosamente');
    console.log(`📊 ${vsds.length} VSDs, ${maintenances.length} mantenimientos, ${parts.length} partes`);

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  }
};
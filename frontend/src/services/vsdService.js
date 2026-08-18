import supabase, { getCachedData } from '../config/supabase';

// Cache de datos
let dataCache = null;
let cacheTime = 0;
const CACHE_DURATION = 30000; // 30 segundos

// Datos de respaldo
const BACKUP_VSDs = [
  { id: '1', codigo_vsd: 'V01', manufacturer: 'VECTOR VII', model: '3R', serial_number: 'J21D8384P', status: 'activo', health_score: 100 },
  { id: '2', codigo_vsd: 'V02', manufacturer: 'SLB - S7 SWD', model: 'S7+D451KCCS', serial_number: '171100200', status: 'activo', health_score: 100 }
];

export const getVSDs = async () => {
  // Usar caché si es reciente
  const now = Date.now();
  if (dataCache && (now - cacheTime) < CACHE_DURATION) {
    console.log('📦 Usando caché de VSDs');
    return dataCache;
  }

  try {
    console.log('📡 Cargando VSDs desde Supabase...');
    
    const { data, error } = await supabase
      .from('vsd')
      .select('*')
      .order('codigo_vsd', { ascending: true });

    if (error) {
      console.warn('⚠️ Error en Supabase:', error.message);
      return BACKUP_VSDs;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No hay datos en Supabase');
      return BACKUP_VSDs;
    }

    // Guardar en caché
    dataCache = data;
    cacheTime = now;
    
    console.log('✅ VSDs cargados:', data.length);
    return data;
  } catch (error) {
    console.warn('⚠️ Error de conexión:', error.message);
    return BACKUP_VSDs;
  }
};

export const generarCodigoVSD = async () => {
  try {
    const vsds = await getVSDs();
    const numeros = vsds
      .map(item => {
        const match = item.codigo_vsd?.match(/V(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);

    if (numeros.length === 0) return 'V01';
    const maxNumero = Math.max(...numeros);
    return `V${String(maxNumero + 1).padStart(2, '0')}`;
  } catch (error) {
    return 'V01';
  }
};

export const createVSD = async (vsdData) => {
  try {
    if (!vsdData.codigo_vsd) {
      vsdData.codigo_vsd = await generarCodigoVSD();
    }

    const { data, error } = await supabase
      .from('vsd')
      .insert([vsdData])
      .select();

    if (error) throw error;
    
    // Limpiar caché para forzar recarga
    dataCache = null;
    cacheTime = 0;
    
    return data?.[0] || null;
  } catch (error) {
    console.error('❌ Error al crear:', error);
    return null;
  }
};

export const updateVSD = async (id, vsdData) => {
  try {
    const { data, error } = await supabase
      .from('vsd')
      .update(vsdData)
      .eq('id', id)
      .select();

    if (error) throw error;
    
    // Limpiar caché
    dataCache = null;
    cacheTime = 0;
    
    return data?.[0] || null;
  } catch (error) {
    console.error('❌ Error al actualizar:', error);
    return null;
  }
};

export const deleteVSD = async (id) => {
  try {
    const { error } = await supabase
      .from('vsd')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Limpiar caché
    dataCache = null;
    cacheTime = 0;
    
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar:', error);
    return false;
  }
};

export const getVSDStats = async () => {
  try {
    const vsds = await getVSDs();
    const total = vsds.length;
    const activos = vsds.filter(v => v.status === 'activo').length;
    const mantenimiento = vsds.filter(v => v.status === 'mantenimiento').length;
    const criticos = vsds.filter(v => v.status === 'critico').length;
    const inactivos = vsds.filter(v => v.status === 'inactivo').length;

    return { total, activos, mantenimiento, criticos, inactivos };
  } catch (error) {
    return { total: 2, activos: 2, mantenimiento: 0, criticos: 0, inactivos: 0 };
  }
};

export default {
  getVSDs,
  generarCodigoVSD,
  createVSD,
  updateVSD,
  deleteVSD,
  getVSDStats
};

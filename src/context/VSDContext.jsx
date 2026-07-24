import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/indexedDBService';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

const VSDContext = createContext();

export const useVSD = () => {
  const context = useContext(VSDContext);
  if (!context) {
    throw new Error('useVSD debe ser usado dentro de VSDProvider');
  }
  return context;
};

export const VSDProvider = ({ children }) => {
  const [vsds, setVsds] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVSD, setSelectedVSD] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await dbService.init();
        await loadAllData();
      } catch (error) {
        console.error('Error inicializando:', error);
        toast.error('Error al inicializar la aplicación');
      } finally {
        setLoading(false);
      }
    };
    init();

    window.addEventListener('online', () => {
      setIsOnline(true);
      toast.info('🟢 Conexión restablecida');
    });
    window.addEventListener('offline', () => {
      setIsOnline(false);
      toast.warning('🔴 Sin conexión - Modo offline activo');
    });

    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  const loadAllData = async () => {
    try {
      const [vsdsData, maintenancesData, partsData] = await Promise.all([
        dbService.getAll('vsds'),
        dbService.getAll('maintenances'),
        dbService.getAll('parts')
      ]);
      setVsds(vsdsData || []);
      setMaintenances(maintenancesData || []);
      setParts(partsData || []);
      console.log('📊 Datos cargados:', {
        vsds: vsdsData?.length || 0,
        maintenances: maintenancesData?.length || 0,
        parts: partsData?.length || 0
      });
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    }
  };

  // ============ CRUD VSDs ============
  const createVSD = async (vsdData) => {
    try {
      const newVSD = {
        ...vsdData,
        _id: uuidv4(),
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        documentos: { planos: [], imagenes: [], manuales: [] },
        mantenimientos: [],
        partes: []
      };
      await dbService.save('vsds', newVSD);
      setVsds(prev => [...prev, newVSD]);
      toast.success('✅ VSD creado correctamente');
      return newVSD;
    } catch (error) {
      console.error('Error creando VSD:', error);
      toast.error('❌ Error al crear el VSD');
      throw error;
    }
  };

  const updateVSD = async (id, vsdData) => {
    try {
      const existing = await dbService.getById('vsds', id);
      if (!existing) throw new Error('VSD no encontrado');
      const updated = { 
        ...existing, 
        ...vsdData, 
        fechaActualizacion: new Date().toISOString() 
      };
      await dbService.save('vsds', updated);
      setVsds(prev => prev.map(v => v._id === id ? updated : v));
      toast.success('✅ VSD actualizado correctamente');
      return updated;
    } catch (error) {
      console.error('Error actualizando VSD:', error);
      toast.error('❌ Error al actualizar el VSD');
      throw error;
    }
  };

  const deleteVSD = async (id) => {
    try {
      const relatedMaintenances = maintenances.filter(m => m.vsdId === id);
      const relatedParts = parts.filter(p => p.vsdId === id);
      
      for (const m of relatedMaintenances) {
        await dbService.delete('maintenances', m._id);
      }
      for (const p of relatedParts) {
        await dbService.delete('parts', p._id);
      }
      
      await dbService.delete('vsds', id);
      setVsds(prev => prev.filter(v => v._id !== id));
      setMaintenances(prev => prev.filter(m => m.vsdId !== id));
      setParts(prev => prev.filter(p => p.vsdId !== id));
      toast.success('✅ VSD eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando VSD:', error);
      toast.error('❌ Error al eliminar el VSD');
      throw error;
    }
  };

  // ============ CRUD Mantenimientos ============
  const createMaintenance = async (maintenanceData) => {
    try {
      const newMaintenance = {
        ...maintenanceData,
        _id: uuidv4(),
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };
      await dbService.save('maintenances', newMaintenance);
      setMaintenances(prev => [...prev, newMaintenance]);
      
      const vsd = await dbService.getById('vsds', maintenanceData.vsdId);
      if (vsd) {
        vsd.mantenimientos = [...(vsd.mantenimientos || []), newMaintenance._id];
        if (maintenanceData.estado === 'completado') {
          vsd.ultimoMantenimiento = new Date().toISOString();
        }
        await dbService.save('vsds', vsd);
        setVsds(prev => prev.map(v => v._id === vsd._id ? vsd : v));
      }
      toast.success('✅ Mantenimiento creado correctamente');
      return newMaintenance;
    } catch (error) {
      console.error('Error creando mantenimiento:', error);
      toast.error('❌ Error al crear el mantenimiento');
      throw error;
    }
  };

  const updateMaintenance = async (id, maintenanceData) => {
    try {
      const existing = await dbService.getById('maintenances', id);
      if (!existing) throw new Error('Mantenimiento no encontrado');
      const updated = { ...existing, ...maintenanceData, fechaActualizacion: new Date().toISOString() };
      await dbService.save('maintenances', updated);
      setMaintenances(prev => prev.map(m => m._id === id ? updated : m));
      
      if (maintenanceData.estado === 'completado') {
        const vsd = await dbService.getById('vsds', existing.vsdId);
        if (vsd) {
          vsd.ultimoMantenimiento = new Date().toISOString();
          await dbService.save('vsds', vsd);
          setVsds(prev => prev.map(v => v._id === vsd._id ? vsd : v));
        }
      }
      toast.success('✅ Mantenimiento actualizado correctamente');
      return updated;
    } catch (error) {
      console.error('Error actualizando mantenimiento:', error);
      toast.error('❌ Error al actualizar el mantenimiento');
      throw error;
    }
  };

  const deleteMaintenance = async (id) => {
    try {
      const maintenance = await dbService.getById('maintenances', id);
      await dbService.delete('maintenances', id);
      setMaintenances(prev => prev.filter(m => m._id !== id));
      
      if (maintenance) {
        const vsd = await dbService.getById('vsds', maintenance.vsdId);
        if (vsd) {
          vsd.mantenimientos = (vsd.mantenimientos || []).filter(mId => mId !== id);
          await dbService.save('vsds', vsd);
          setVsds(prev => prev.map(v => v._id === vsd._id ? vsd : v));
        }
      }
      toast.success('✅ Mantenimiento eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando mantenimiento:', error);
      toast.error('❌ Error al eliminar el mantenimiento');
      throw error;
    }
  };

  // ============ CRUD Partes ============
  const createPart = async (partData) => {
    try {
      const newPart = {
        ...partData,
        _id: uuidv4(),
        fechaRegistro: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString()
      };
      await dbService.save('parts', newPart);
      setParts(prev => [...prev, newPart]);
      
      const vsd = await dbService.getById('vsds', partData.vsdId);
      if (vsd) {
        vsd.partes = [...(vsd.partes || []), newPart._id];
        await dbService.save('vsds', vsd);
        setVsds(prev => prev.map(v => v._id === vsd._id ? vsd : v));
      }
      toast.success('✅ Parte creada correctamente');
      return newPart;
    } catch (error) {
      console.error('Error creando parte:', error);
      toast.error('❌ Error al crear la parte');
      throw error;
    }
  };

  const updatePart = async (id, partData) => {
    try {
      const existing = await dbService.getById('parts', id);
      if (!existing) throw new Error('Parte no encontrada');
      const updated = { ...existing, ...partData, ultimaActualizacion: new Date().toISOString() };
      await dbService.save('parts', updated);
      setParts(prev => prev.map(p => p._id === id ? updated : p));
      toast.success('✅ Parte actualizada correctamente');
      return updated;
    } catch (error) {
      console.error('Error actualizando parte:', error);
      toast.error('❌ Error al actualizar la parte');
      throw error;
    }
  };

  const deletePart = async (id) => {
    try {
      const part = await dbService.getById('parts', id);
      await dbService.delete('parts', id);
      setParts(prev => prev.filter(p => p._id !== id));
      
      if (part) {
        const vsd = await dbService.getById('vsds', part.vsdId);
        if (vsd) {
          vsd.partes = (vsd.partes || []).filter(pId => pId !== id);
          await dbService.save('vsds', vsd);
          setVsds(prev => prev.map(v => v._id === vsd._id ? vsd : v));
        }
      }
      toast.success('✅ Parte eliminada correctamente');
    } catch (error) {
      console.error('Error eliminando parte:', error);
      toast.error('❌ Error al eliminar la parte');
      throw error;
    }
  };

  // ============ FUNCIONES PARA DOCUMENTOS ============
  const addDocument = async (vsdId, tipo, documento) => {
    try {
      const vsd = await dbService.getById('vsds', vsdId);
      if (!vsd) throw new Error('VSD no encontrado');
      
      if (!vsd.documentos) vsd.documentos = { planos: [], imagenes: [], manuales: [] };
      
      const newDoc = {
        id: uuidv4(),
        nombre: documento.nombre || 'Documento',
        url: documento.url || '',
        tipo: documento.tipo || 'image',
        fechaSubida: new Date().toISOString()
      };
      
      vsd.documentos[tipo].push(newDoc);
      await dbService.save('vsds', vsd);
      setVsds(prev => prev.map(v => v._id === vsdId ? vsd : v));
      toast.success(`✅ ${tipo === 'imagenes' ? 'Imagen' : 'Documento'} agregado correctamente`);
      return newDoc;
    } catch (error) {
      console.error('Error agregando documento:', error);
      toast.error('❌ Error al agregar el documento');
      throw error;
    }
  };

  const deleteDocument = async (vsdId, tipo, docId) => {
    try {
      const vsd = await dbService.getById('vsds', vsdId);
      if (!vsd) throw new Error('VSD no encontrado');
      
      vsd.documentos[tipo] = vsd.documentos[tipo].filter(d => d.id !== docId);
      await dbService.save('vsds', vsd);
      setVsds(prev => prev.map(v => v._id === vsdId ? vsd : v));
      toast.success('✅ Documento eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando documento:', error);
      toast.error('❌ Error al eliminar el documento');
      throw error;
    }
  };

  // ============ FUNCIONES PARA IMÁGENES DE VSD (MÁXIMO 4) ============
  const addImageToVSD = async (vsdId, imageData) => {
    try {
      const vsd = await dbService.getById('vsds', vsdId);
      if (!vsd) throw new Error('VSD no encontrado');
      
      if (!vsd.documentos) vsd.documentos = { imagenes: [], planos: [], manuales: [] };
      
      // Verificar límite de 4 imágenes
      if (vsd.documentos.imagenes.length >= 4) {
        toast.warning('⚠️ Máximo 4 imágenes permitidas por VSD');
        return null;
      }
      
      const newImage = {
        id: uuidv4(),
        nombre: imageData.nombre || `Imagen_${new Date().toISOString().slice(0,10)}`,
        url: imageData.url,
        tipo: 'image',
        fechaSubida: new Date().toISOString()
      };
      
      vsd.documentos.imagenes.push(newImage);
      await dbService.save('vsds', vsd);
      setVsds(prev => prev.map(v => v._id === vsdId ? vsd : v));
      toast.success(`✅ Imagen agregada (${vsd.documentos.imagenes.length}/4)`);
      return newImage;
    } catch (error) {
      console.error('Error agregando imagen:', error);
      toast.error('❌ Error al agregar la imagen');
      throw error;
    }
  };

  const removeImageFromVSD = async (vsdId, imageId) => {
    try {
      const vsd = await dbService.getById('vsds', vsdId);
      if (!vsd) throw new Error('VSD no encontrado');
      
      vsd.documentos.imagenes = vsd.documentos.imagenes.filter(img => img.id !== imageId);
      await dbService.save('vsds', vsd);
      setVsds(prev => prev.map(v => v._id === vsdId ? vsd : v));
      toast.success('✅ Imagen eliminada');
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      toast.error('❌ Error al eliminar la imagen');
      throw error;
    }
  };

  // ============ FUNCIONES DE BÚSQUEDA ============
  const searchVSDs = useCallback((term) => {
    if (!term || term.trim() === '') return vsds;
    const lowerTerm = term.toLowerCase().trim();
    return vsds.filter(vsd =>
      (vsd.nombre?.toLowerCase() || '').includes(lowerTerm) ||
      (vsd.serie?.toLowerCase() || '').includes(lowerTerm) ||
      (vsd.ubicacion?.toLowerCase() || '').includes(lowerTerm) ||
      (vsd.marca?.toLowerCase() || '').includes(lowerTerm) ||
      (vsd.modelo?.toLowerCase() || '').includes(lowerTerm)
    );
  }, [vsds]);

  const getMaintenancesByVSD = useCallback((vsdId) => {
    return maintenances.filter(m => m.vsdId === vsdId);
  }, [maintenances]);

  const getPartsByVSD = useCallback((vsdId) => {
    return parts.filter(p => p.vsdId === vsdId);
  }, [parts]);

  // ============ ESTADÍSTICAS ============
  const getVSDStats = useCallback(() => {
    return {
      total: vsds.length,
      activos: vsds.filter(v => v.estado === 'activo').length,
      mantenimiento: vsds.filter(v => v.estado === 'mantenimiento').length,
      inactivos: vsds.filter(v => v.estado === 'inactivo').length,
      mantenimientos: {
        total: maintenances.length,
        pendientes: maintenances.filter(m => m.estado === 'pendiente').length,
        en_progreso: maintenances.filter(m => m.estado === 'en_progreso').length,
        completados: maintenances.filter(m => m.estado === 'completado').length,
        cancelados: maintenances.filter(m => m.estado === 'cancelado').length
      },
      partes: parts.length
    };
  }, [vsds, maintenances, parts]);

  // ============ VALUE ============
  const value = {
    vsds,
    maintenances,
    parts,
    loading,
    isOnline,
    searchTerm,
    selectedVSD,
    setSearchTerm,
    setSelectedVSD,
    createVSD,
    updateVSD,
    deleteVSD,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
    createPart,
    updatePart,
    deletePart,
    addDocument,
    deleteDocument,
    addImageToVSD,
    removeImageFromVSD,
    searchVSDs,
    getMaintenancesByVSD,
    getPartsByVSD,
    getVSDStats,
    loadAllData
  };

  return <VSDContext.Provider value={value}>{children}</VSDContext.Provider>;
};
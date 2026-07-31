import React, { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';
import { supabase } from '../config/supabase';

// Configurar localforage
localforage.config({
  name: 'VSD_Smart_Offline',
  storeName: 'app_data',
});

const SyncContext = createContext();

export const useSync = () => useContext(SyncContext);

export const SyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [offlineQueue, setOfflineQueue] = useState([]);

  // Detectar cambios en la conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cargar cola de acciones offline al iniciar
  useEffect(() => {
    const loadQueue = async () => {
      const savedQueue = await localforage.getItem('offline_queue');
      if (savedQueue) setOfflineQueue(savedQueue);
    };
    loadQueue();
  }, []);

  // Guardar cola cuando cambie
  useEffect(() => {
    localforage.setItem('offline_queue', offlineQueue);
  }, [offlineQueue]);

  // Función para guardar datos localmente
  const saveLocally = async (key, data) => {
    await localforage.setItem(key, data);
  };

  const loadLocally = async (key) => {
    return await localforage.getItem(key);
  };

  // Agregar acción a la cola offline
  const addToOfflineQueue = (action) => {
    setOfflineQueue((prev) => [...prev, { ...action, timestamp: Date.now() }]);
  };

  // Función de sincronización (Manual o Automática)
  const syncData = async (showFeedback = false) => {
    if (!isOnline) {
      if (showFeedback) alert('Sin conexión. Los cambios se guardaron localmente y se sincronizarán cuando haya internet.');
      return;
    }

    setIsSyncing(true);
    try {
      // 1. Obtener datos frescos de Supabase
      const { data: vsdData } = await supabase.from('vsd').select('*');
      const { data: mtoData } = await supabase.from('maintenance_logs').select('*');
      const { data: partsData } = await supabase.from('parts_inventory').select('*');

      // 2. Guardarlos en IndexedDB
      if (vsdData) await saveLocally('offline_vsds', vsdData);
      if (mtoData) await saveLocally('offline_maintenance', mtoData);
      if (partsData) await saveLocally('offline_parts', partsData);

      // 3. Procesar la cola de acciones offline (Insert/Update)
      const queue = [...offlineQueue];
      const newQueue = [];

      for (const action of queue) {
        try {
          if (action.type === 'INSERT') {
            await supabase.from(action.table).insert(action.data);
          } else if (action.type === 'UPDATE') {
            await supabase.from(action.table).update(action.data).eq('id', action.id);
          } else if (action.type === 'DELETE') {
            await supabase.from(action.table).delete().eq('id', action.id);
          }
        } catch (error) {
          // Si falla, se queda en la cola
          newQueue.push(action);
        }
      }

      setOfflineQueue(newQueue);
      setLastSyncTime(new Date().toLocaleTimeString());
      if (showFeedback) alert('✅ Sincronización completada con éxito.');
      
    } catch (error) {
      console.error('Error durante la sincronización:', error);
      if (showFeedback) alert('❌ Error al sincronizar. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Sincronización automática cada 5 minutos si hay internet
  useEffect(() => {
    if (isOnline) {
      const interval = setInterval(() => syncData(false), 300000); // 5 minutos
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  return (
    <SyncContext.Provider value={{
      isOnline,
      isSyncing,
      lastSyncTime,
      saveLocally,
      loadLocally,
      addToOfflineQueue,
      offlineQueue,
      syncData,
      // Métodos helpers para los componentes
      getOfflineData: loadLocally
    }}>
      {children}
    </SyncContext.Provider>
  );
};

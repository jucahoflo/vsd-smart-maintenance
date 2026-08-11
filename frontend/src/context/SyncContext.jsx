import React, { createContext, useContext, useState, useEffect } from 'react';

const SyncContext = createContext();

export const useSync = () => useContext(SyncContext);

export const SyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);

  // Detectar cambios de conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🟢 Conexión restaurada. Iniciando sincronización...');
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log('🔴 Modo Offline activado.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sincronización automática al volver a estar Online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      console.log(`🔄 Sincronizando ${offlineQueue.length} acciones pendientes...`);
      // Aquí se procesará la cola (se ejecutará desde el componente)
    }
  }, [isOnline, offlineQueue]);

  // Agregar una acción a la cola offline
  const addToQueue = (action) => {
    setOfflineQueue((prev) => [...prev, { ...action, timestamp: Date.now() }]);
    console.log('📝 Acción guardada en cola offline:', action);
  };

  // Limpiar la cola después de sincronizar
  const clearQueue = () => {
    setOfflineQueue([]);
    console.log('✅ Cola offline vaciada.');
  };

  const value = {
    isOnline,
    offlineQueue,
    addToQueue,
    clearQueue
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

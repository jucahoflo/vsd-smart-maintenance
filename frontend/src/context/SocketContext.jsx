import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // SOLO CONECTAR EN DESARROLLO LOCAL
    const isDevelopment = import.meta.env.MODE === 'development';
    
    if (!isDevelopment) {
      console.log('🔌 WebSocket desactivado en producción');
      setConnected(false);
      return;
    }

    console.log('🔌 Intentando conectar WebSocket...');
    
    const newSocket = io('http://localhost:5000', {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 3,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket conectado');
      setConnected(true);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ WebSocket error:', err.message);
      setConnected(false);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.close();
    };
  }, []);

  const joinVFD = (vfdId) => {
    if (socket && connected) {
      socket.emit('join-vfd', vfdId);
    }
  };

  const onTelemetry = (callback) => {
    if (socket) {
      socket.on('telemetry-received', callback);
      return () => socket.off('telemetry-received', callback);
    }
    return () => {};
  };

  const onAlerts = (callback) => {
    if (socket) {
      socket.on('alerts', callback);
      return () => socket.off('alerts', callback);
    }
    return () => {};
  };

  return (
    <SocketContext.Provider value={{
      socket,
      connected,
      joinVFD,
      onTelemetry,
      onAlerts
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

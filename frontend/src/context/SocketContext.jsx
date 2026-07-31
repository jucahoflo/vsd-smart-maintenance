import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // ENLACE DE SEGURIDAD: Conectamos a un servidor de sockets VACÍO
    // Esto evita que Vercel falle al compilar y permite que la app cargue
    let socketInstance = null;

    try {
      socketInstance = io({
        autoConnect: false
      });
      
      socketInstance.on('connect', () => {
        setConnected(true);
        console.log('🔌 Socket conectado (modo seguro)');
      });

      socketInstance.on('disconnect', () => {
        setConnected(false);
        console.log('🔌 Socket desconectado');
      });

      socketInstance.connect();
      setSocket(socketInstance);
    } catch (error) {
      console.warn('⚠️ Socket no disponible, app funcionando en modo normal');
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

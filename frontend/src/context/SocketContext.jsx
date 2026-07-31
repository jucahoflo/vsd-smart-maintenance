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
    // Conexión al servidor de sockets (puedes cambiar la URL si tienes un backend real)
    // Si no tienes backend de sockets, esto conectará a un servidor dummy o se quedará offline
    const socketInstance = io('https://your-socket-server.com', {
      autoConnect: false
    });

    socketInstance.on('connect', () => {
      setConnected(true);
      console.log('🔌 Socket conectado');
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
      console.log('🔌 Socket desconectado');
    });

    socketInstance.connect();
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

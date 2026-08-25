import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect when user is logged in
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
    console.log(`🔌 Connecting to WebSocket server: ${socketUrl}`);

    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected successfully!');
      setConnected(true);
      if (user) {
        newSocket.emit('register-user', user.id);
      }
    });    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected.');
      setConnected(false);
    });

    setSocket(newSocket);

    // Clean up on unmount or user change
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  /**
   * Helper to join room
   */
  const joinRoom = (roomId) => {
    if (socket && connected && roomId && user) {
      socket.emit('join-room', { roomId, user });
    }
  };

  /**
   * Helper to leave room
   */
  const leaveRoom = (roomId) => {
    if (socket && connected && roomId) {
      socket.emit('leave-room', { roomId });
    }
  };

  const value = {
    socket,
    connected,
    joinRoom,
    leaveRoom,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

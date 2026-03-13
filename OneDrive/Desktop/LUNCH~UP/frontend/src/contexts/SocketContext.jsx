import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const SocketContext = createContext({ socket: null, newOrderCount: 0, resetOrderCount: () => {} });

const playNotificationSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const user = useAuthStore((s) => s.user);

  const resetOrderCount = () => setNewOrderCount(0);

  useEffect(() => {
    // Ne connecter le socket que pour un utilisateur authentifié
    if (!user) {
      return;
    }

    // remove /api suffix if present and default to port 5000
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    url = url.replace(/\/api\/?$/, '');

    const s = io(url, {
      // laisser socket.io choisir les bons transports
      withCredentials: false,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    setSocket(s);

    s.emit('register', { userId: user.id, role: user.role });

    if (user.role === 'vendor') {
      s.on('new_order', () => {
        playNotificationSound();
        setNewOrderCount((prev) => prev + 1);
        toast.success('Nouvelle commande reçue');
      });
    }

    if (user.role === 'user') {
      s.on('order_updated', () => {
        toast.success('Votre commande a été mise à jour');
      });
    }

    return () => {
      s.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, newOrderCount, resetOrderCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

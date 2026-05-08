import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
let socket;

export function getSocket() {
  const token = localStorage.getItem('hkick_token');
  if (!token) return null;
  if (token.startsWith('dev-token-')) return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnectionAttempts: 2,
      timeout: 2500
    });
  }

  return socket;
}

export function resetSocket() {
  socket?.disconnect();
  socket = null;
}

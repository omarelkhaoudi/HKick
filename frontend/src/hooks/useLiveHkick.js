import { useEffect } from 'react';
import { getSocket } from '../services/socket';

export function useLiveHkick({ onMatch, onAvailability, onBooking } = {}) {
  useEffect(() => {
    let socket;
    try {
      socket = getSocket();
    } catch {
      return;
    }
    if (!socket) return;

    socket.emit('availability:online');
    socket.on('match:created', onMatch);
    socket.on('match:updated', onMatch);
    socket.on('availability:updated', onAvailability);
    socket.on('booking:created', onBooking);

    return () => {
      safeRemoveListener(socket, 'match:created', onMatch);
      safeRemoveListener(socket, 'match:updated', onMatch);
      safeRemoveListener(socket, 'availability:updated', onAvailability);
      safeRemoveListener(socket, 'booking:created', onBooking);
    };
  }, [onAvailability, onBooking, onMatch]);
}

function safeRemoveListener(socket, event, handler) {
  try {
    if (typeof socket?.off === 'function') {
      socket.off(event, handler);
      return;
    }

    if (typeof socket?.removeListener === 'function') {
      socket.removeListener(event, handler);
    }
  } catch {
    // Live cleanup should never blank the app.
  }
}

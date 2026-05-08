import { create } from 'zustand';
import { notificationApi } from '../services/api';

const starterNotifications = [
  {
    id: 'seed-1',
    type: 'match',
    title: 'Fast fill detected',
    body: 'Maarif 5v5 needs 2 more players and starts soon.',
    createdAt: new Date().toISOString(),
    read: false
  },
  {
    id: 'seed-2',
    type: 'booking',
    title: 'Pitch slots live',
    body: 'New evening slots are available in Casablanca.',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false
  }
];

export const useNotificationStore = create((set, get) => ({
  notifications: loadStoredNotifications(),
  hydrate: async () => {
    try {
      const data = await notificationApi.list();
      const notifications = normalizeNotifications(data.notifications);
      localStorage.setItem('hkick_notifications', JSON.stringify(notifications));
      set({ notifications });
    } catch {
      set({ notifications: normalizeNotifications(get().notifications) });
    }
  },
  addNotification: (notification) => {
    if (!notification) return;
    const current = normalizeNotifications(get().notifications);
    const next = [
      {
        id: notification.id || `notification-${Date.now()}`,
        createdAt: new Date().toISOString(),
        read: false,
        ...notification
      },
      ...current
    ].slice(0, 30);
    localStorage.setItem('hkick_notifications', JSON.stringify(next));
    set({ notifications: next });
  },
  markAllRead: async () => {
    try {
      const data = await notificationApi.markRead();
      const notifications = normalizeNotifications(data.notifications);
      localStorage.setItem('hkick_notifications', JSON.stringify(notifications));
      set({ notifications });
      return;
    } catch {
      // fall back to local read state
    }
    const next = normalizeNotifications(get().notifications).map((notification) => ({ ...notification, read: true }));
    localStorage.setItem('hkick_notifications', JSON.stringify(next));
    set({ notifications: next });
  },
  clear: async () => {
    try {
      await notificationApi.clear();
    } catch {
      // local fallback
    }
    localStorage.setItem('hkick_notifications', JSON.stringify([]));
    set({ notifications: [] });
  }
}));

function loadStoredNotifications() {
  try {
    return normalizeNotifications(JSON.parse(localStorage.getItem('hkick_notifications') || 'null'));
  } catch {
    localStorage.removeItem('hkick_notifications');
    return starterNotifications;
  }
}

function normalizeNotifications(value) {
  if (!Array.isArray(value)) return starterNotifications;
  return value
    .filter(Boolean)
    .map((notification) => ({
      id: notification.id || `notification-${Math.random().toString(36).slice(2)}`,
      type: (notification.type || 'system').toLowerCase(),
      title: notification.title || 'HKick update',
      body: notification.body || 'New football activity is available.',
      createdAt: notification.createdAt || new Date().toISOString(),
      read: Boolean(notification.read)
    }));
}

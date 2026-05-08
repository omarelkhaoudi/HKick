const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function api(path, options = {}) {
  const token = localStorage.getItem('hkick_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const authApi = {
  login: (payload) => api('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => api('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => api('/auth/me')
};

export const matchApi = {
  list: () => api('/matches'),
  create: (payload) => api('/matches', { method: 'POST', body: JSON.stringify(payload) }),
  matchmaking: () => api('/matches/matchmaking'),
  instant: () => api('/matches/matchmaking/instant', { method: 'POST' }),
  join: (id) => api(`/matches/${id}/join`, { method: 'POST' }),
  leave: (id) => api(`/matches/${id}/leave`, { method: 'POST' }),
  message: (id, body) => api(`/matches/${id}/messages`, { method: 'POST', body: JSON.stringify({ body }) })
};

export const terrainApi = {
  list: () => api('/terrains')
};

export const bookingApi = {
  create: (payload) => api('/bookings', { method: 'POST', body: JSON.stringify(payload) })
};

export const availabilityApi = {
  nearby: () => api('/availability/nearby'),
  set: (isAvailable) => api('/availability', { method: 'PATCH', body: JSON.stringify({ isAvailable }) })
};

export const profileApi = {
  update: (payload) => api('/profile', { method: 'PATCH', body: JSON.stringify(payload) })
};

export const walletApi = {
  get: () => api('/wallet'),
  topUp: (amount) => api('/wallet/top-up', { method: 'POST', body: JSON.stringify({ amount }) }),
  deposit: (amount) => api('/wallet/deposit', { method: 'POST', body: JSON.stringify({ amount }) })
};

export const notificationApi = {
  list: () => api('/notifications'),
  markRead: () => api('/notifications/read', { method: 'POST' }),
  clear: () => api('/notifications', { method: 'DELETE' })
};

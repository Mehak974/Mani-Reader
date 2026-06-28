import axios from 'axios';

export const getApiServerUrl = () => {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL;
  if (rawUrl) {
    const cleaned = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
    return cleaned.endsWith('/api') ? cleaned.slice(0, -4) : cleaned;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('manireader.online')) {
    return 'https://api.manireader.online';
  }
  return '';
};

const getBaseUrl = () => {
  // Use environment variable if provided
  const rawUrl = process.env.NEXT_PUBLIC_API_URL;
  if (rawUrl) {
    const cleaned = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
    return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
  }
  // Fallback: if running on the live domain, target the live API
  if (typeof window !== 'undefined' && window.location.hostname.includes('manireader.online')) {
    return 'https://api.manireader.online/api';
  }
  // Default to relative path for local development
  return '/api';
};

const apiBaseUrl = getBaseUrl();

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 30000,
});

// Auto-attach access token from memory if available
let _accessToken = null;
export function setAccessToken(token) { _accessToken = token; }
export function getAccessToken() { return _accessToken; }

api.interceptors.request.use((config) => {
  if (_accessToken) config.headers['Authorization'] = `Bearer ${_accessToken}`;

  if (typeof window !== 'undefined') {
    let deviceId = localStorage.getItem('mani_device_id');
    if (!deviceId) {
      deviceId = 'dv_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('mani_device_id', deviceId);
    }
    config.headers['X-Device-ID'] = deviceId;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      try {
        const { data } = await axios.post(`${apiBaseUrl}/auth/refresh`, {}, { withCredentials: true });
        _accessToken = data.accessToken;
        err.config.headers['Authorization'] = `Bearer ${_accessToken}`;
        return api(err.config);
      } catch {
        _accessToken = null;
      }
    }
    return Promise.reject(err);
  }
);

// ── Manga ─────────────────────────────────────────────────────────────────────
export const mangaApi = {
  search: (q, page = 1) => api.get(`/search?q=${encodeURIComponent(q)}&page=${page}`),
  info: (id) => api.get(`/manga/${id}`),
  popular: (page = 1, genre = null, config = {}) => {
    let url = `/manga/browse/popular?page=${page}`;
    if (genre) url += `&genre=${encodeURIComponent(genre)}`;
    return api.get(url, config);
  },
  mostRead: () => api.get('/manga/most-read'),
  recent: (page = 1, config = {}) => api.get(`/manga/browse/recent?page=${page}`, config),
  chapters: (mangaId) => api.get(`/chapters/${mangaId}`),
  pages: (chapterId, mangaId) => api.get(`/chapter/${chapterId}/pages?mangaId=${mangaId}`),
  browse: (filters = {}) => {
    const { genres = [], status = 0, order = 0, page = 1 } = filters;
    const g = Array.isArray(genres) ? genres.join(',') : genres;
    return api.get(`/manga/browse/filter?include=${encodeURIComponent(g)}&status=${status}&order=${order}&page=${page}`);
  },
  browseRaw: (qs) => api.get(`/manga/browse/filter?${qs}`),
  rate: (id, score) => api.post(`/manga/${id}/rate`, { score }),
  related: (id) => api.get(`/manga/${id}/related`),
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (email, password) => api.post('/auth/register', { email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  nsfw: (val) => api.patch('/auth/nsfw', { nsfw: val }),
  deleteAccount: () => api.delete('/auth/me'),
};

// ── Libraries ─────────────────────────────────────────────────────────────────
export const libraryApi = {
  list: () => api.get('/library'),
  create: (name) => api.post('/library', { name }),
  delete: (id) => api.delete(`/library/${id}`),
  add: (id, mangaId) => api.post(`/library/${id}/add`, { mangaId }),
  remove: (id, mangaId) => api.delete(`/library/${id}/remove?mangaId=${mangaId}`),
};

// ── Bookmarks ─────────────────────────────────────────────────────────────────
export const bookmarkApi = {
  list: () => api.get('/bookmark'),
  set: (mangaId, chapterId, page) => api.post('/bookmark', { mangaId, chapterId, page }),
  delete: (mangaId) => api.delete(`/bookmark/${mangaId}`),
};

// ── History ───────────────────────────────────────────────────────────────────
export const historyApi = {
  list: (skip = 0, take = 50) => api.get(`/history?skip=${skip}&take=${take}`),
  add: (mangaId, chapterId, page) => api.post('/history', { mangaId, chapterId, page }),
  clear: () => api.delete('/history'),
};

// ── Progress ──────────────────────────────────────────────────────────────────
export const progressApi = {
  forManga: (mangaId) => api.get(`/progress/${mangaId}`),
  last: (mangaId) => api.get(`/progress/${mangaId}/last`),
  set: (mangaId, chapterId, page, isRead) =>
    api.post('/progress', { mangaId, chapterId, page, isRead }),
};


// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: () => api.get('/admin/users'),
  detail: (id) => api.get(`/admin/users/${id}`),
  toggleVip: (id, v) => api.patch(`/admin/users/${id}/vip`, { isVip: v }),
  mangaStats: () => api.get('/admin/manga'),
  messages: () => api.get('/admin/messages'),
  guestUsers: () => api.get('/admin/guest-users'),
  replyToMessage: (id, reply) => api.patch(`/admin/messages/${id}/reply`, { reply }),
  deleteMessage: (id) => api.delete(`/admin/messages/${id}`),
  topReaders: () => api.get('/admin/top-readers'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleBan: (id, b) => api.patch(`/admin/users/${id}/ban`, { isBanned: b }),
  auditLogs: () => api.get('/admin/audit-logs'),
  searchStats: () => api.get('/admin/search-analytics'),
  adStats: () => api.get('/admin/ad-stats'),
  broadcast: (msg) => api.post('/admin/announcements', { message: msg }),
  dashboardAnalytics: () => api.get('/admin/dashboard-stats'),
  graphData: (type) => api.get(`/admin/graph-data?type=${type}`),
  // New Security & Control
  getBannedIps: () => api.get('/admin/banned-ips'),
  banIp: (ip, reason) => api.post('/admin/banned-ips', { ip, reason }),
  unbanIp: (ip) => api.delete(`/admin/banned-ips/${ip}`),
  hideManga: (id, hide) => api.patch(`/admin/manga/${id}/hide`, { isHidden: hide }),
  changeRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.patch('/admin/settings', { settings }),
};

export const userActivityApi = {
  adEvent: (type) => api.post('/user/ad-event', { type }),
  heartbeat: (ms) => api.post('/user/heartbeat', { ms }),
};

export const contactApi = {
  send: (data) => api.post('/contact', data),
};

export const blogApi = {
  list: (category) => api.get(category ? `/blog?category=${encodeURIComponent(category)}` : '/blog'),
  get: (slug) => api.get(`/blog/${slug}`),
  create: (data) => api.post('/blog', data),
  update: (id, data) => api.patch(`/blog/${id}`, data),
  delete: (id) => api.delete(`/blog/${id}`),
  createEntry: (blogId, data) => api.post(`/blog/${blogId}/entries`, data),
  updateEntry: (blogId, entryId, data) => api.patch(`/blog/${blogId}/entries/${entryId}`, data),
  deleteEntry: (blogId, entryId) => api.delete(`/blog/${blogId}/entries/${entryId}`),
};

export default api;

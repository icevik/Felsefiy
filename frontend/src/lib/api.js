import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = window.localStorage.getItem('authToken');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to read auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      try {
        window.localStorage.removeItem('authToken');
      } catch (e) {
        console.error('Failed to clear auth token:', e);
      }
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me')
};

// Projects API
export const projectsApi = {
  getAll: () => api.get('/projects'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  test: (id, prompt) => api.post(`/projects/${id}/test`, { prompt })
};

// Sessions API
export const sessionsApi = {
  getAll: (params) => api.get('/sessions', { params }),
  getOne: (id) => api.get(`/sessions/${id}`),
  create: (data) => api.post('/sessions', data),
  stop: (id) => api.post(`/sessions/${id}/stop`),
  delete: (id) => api.delete(`/sessions/${id}`),
  getMessages: (id, params) => api.get(`/sessions/${id}/messages`, { params }),
  
  // Batch (Parallel) Attack API
  createBatch: (data) => api.post('/sessions/batch', data),
  getBatchStatus: (batchId) => api.get(`/sessions/batch/${batchId}`),
  stopBatch: (batchId) => api.post(`/sessions/batch/${batchId}/stop`)
};

// Strategies API
export const strategiesApi = {
  getAll: () => api.get('/strategies'),
  getOne: (id) => api.get(`/strategies/${id}`),
  create: (data) => api.post('/strategies', data),
  update: (id, data) => api.put(`/strategies/${id}`, data),
  delete: (id) => api.delete(`/strategies/${id}`),
  seed: () => api.post('/strategies/seed')
};

// Prompt Optimizer API
export const optimizerApi = {
  // Öneriler
  getSuggestions: (projectId) => api.get(`/optimizer/suggestions/${projectId}`),
  
  // Başarılı saldırılar
  getSuccessfulAttacks: (projectId) => api.get(`/optimizer/successful-attacks/${projectId}`),
  saveAttack: (data) => api.post('/optimizer/save-attack', data),
  getAttacks: (projectId) => api.get(`/optimizer/attacks/${projectId}`),
  
  // Optimizasyon
  optimize: (data) => api.post('/optimizer/optimize', data),
  combine: (projectId, model) => api.post(`/optimizer/combine/${projectId}`, { model }),
  analyze: (prompt, model) => api.post('/optimizer/analyze', { prompt, model }),
  
  // Optimize edilmiş promptlar
  getOptimized: (projectId) => api.get(`/optimizer/optimized/${projectId}`),
  deleteOptimized: (id) => api.delete(`/optimizer/optimized/${id}`),
  updatePerformance: (id, wasSuccessful) => api.post(`/optimizer/performance/${id}`, { wasSuccessful }),
  
  // Şablonlar
  getTemplates: (category) => api.get('/optimizer/templates', { params: { category } }),
  createTemplate: (data) => api.post('/optimizer/templates', data),
  generateFromTemplate: (id, variables) => api.post(`/optimizer/templates/${id}/generate`, { variables }),
  deleteTemplate: (id) => api.delete(`/optimizer/templates/${id}`),
  seedTemplates: () => api.post('/optimizer/templates/seed')
};

// Reports API
export const reportsApi = {
  generate: (projectId) => api.post(`/reports/generate/${projectId}`),
  getByProject: (projectId) => api.get(`/reports/project/${projectId}`),
  getOne: (id) => api.get(`/reports/${id}`),
  delete: (id) => api.delete(`/reports/${id}`),
  export: (projectId, format) => api.post(`/reports/export/${projectId}`, { format }),
  getStats: (projectId) => api.get(`/reports/stats/${projectId}`)
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;

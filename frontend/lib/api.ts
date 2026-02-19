import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; full_name: string; role?: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const properties = {
  list: () => api.get('/properties'),
  get: (id: string) => api.get(`/properties/${id}`),
  create: (data: any) => api.post('/properties', data),
  update: (id: string, data: any) => api.put(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
  getRooms: (id: string) => api.get(`/properties/${id}/rooms`),
  createRoom: (propertyId: string, data: any) => api.post(`/properties/${propertyId}/rooms`, data),
};

export const bookings = {
  list: () => api.get('/bookings'),
  get: (id: string) => api.get(`/bookings/${id}`),
  create: (data: any) => api.post('/bookings', data),
  confirm: (id: string) => api.put(`/bookings/${id}/confirm`),
  pay: (id: string) => api.put(`/bookings/${id}/pay`),
  cancel: (id: string) => api.put(`/bookings/${id}/cancel`),
};

export const chat = {
  send: (message: string, conversationId: string) =>
    api.post('/chat', { message, conversation_id: conversationId }),
  getMessages: (conversationId: string) =>
    api.get(`/messages/conversations/${conversationId}`),
};

export const messages = {
  getEscalations: () => api.get('/messages/escalations'),
  respondEscalation: (messageId: string, data: { admin_response: string; status: string }) =>
    api.put(`/messages/escalations/${messageId}`, data),
};

export const documents = {
  list: () => api.get('/documents'),
  create: (data: any) => api.post('/documents', data),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

export default api;

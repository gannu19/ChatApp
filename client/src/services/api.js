import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Request interceptor to attach JWT token
API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch (e) {
      console.error('Error parsing token from storage:', e);
    }
  }
  return config;
});

// Auth endpoints
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerUser = (userData) => API.post('/auth/register', userData);
export const fetchMe = () => API.get('/auth/me');

// User endpoints
export const searchUsers = (query) => API.get(`/users?search=${encodeURIComponent(query)}`);
export const updateProfile = (data) => API.put('/users/profile', data);
export const fetchUserById = (id) => API.get(`/users/${id}`);

// Chat & Group endpoints
export const accessOrCreateChat = (userId) => API.post('/chats', { userId });
export const fetchChats = () => API.get('/chats');
export const fetchChatById = (chatId) => API.get(`/chats/${chatId}`);
export const createGroup = (data) => API.post('/chats/group', data);
export const renameGroup = (chatId, data) => API.put(`/chats/group/${chatId}/rename`, data);
export const addGroupMember = (chatId, userId) => API.put(`/chats/group/${chatId}/members`, { userId });
export const removeGroupMember = (chatId, userId) => API.delete(`/chats/group/${chatId}/members`, { data: { userId } });
export const leaveGroup = (chatId) => API.put(`/chats/group/${chatId}/leave`);

// Message endpoints
export const sendMessage = (data) => API.post('/messages', data);
export const fetchMessages = (chatId, page = 1, limit = 50) => API.get(`/messages/${chatId}?page=${page}&limit=${limit}`);
export const markMessageRead = (messageId) => API.put(`/messages/${messageId}/read`);

export default API;

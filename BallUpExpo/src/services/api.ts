import axios from 'axios';
import { Platform } from 'react-native';
import { tokenStorage } from './tokenStorage';

// API Base URL configuration
const API_BASE_URL = Platform.select({
  ios: 'http://localhost:3000/api',
  android: 'http://10.0.2.2:3000/api', // Android emulator localhost
  default: 'http://localhost:3000/api',
}) as string;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      await tokenStorage.removeToken();
      // You might want to redirect to login screen here
      console.warn('Authentication failed. Token cleared.');
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await tokenStorage.setToken(token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } catch (error) {
    console.error('Failed to set auth token:', error);
    throw error;
  }
};

export const clearAuthToken = async (): Promise<void> => {
  try {
    await tokenStorage.removeToken();
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Failed to clear auth token:', error);
    throw error;
  }
};

export const initializeAuth = async (): Promise<boolean> => {
  try {
    const token = await tokenStorage.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    return false;
  }
};

export const apiService = {
  // Auth
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  register: (userData: { 
    email: string; 
    username: string; 
    password: string; 
  }) => api.post('/auth/register', userData),
  
  // Locations
  getLocations: () => api.get('/locations'),
  getLocationById: (locationId: string) => api.get(`/locations/${locationId}`),
  createLocation: (location: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    description?: string;
    amenities: string[];
  }) => api.post('/locations', location),
  updateLocation: (locationId: string, location: {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    amenities?: string[];
  }) => api.put(`/locations/${locationId}`, location),
  deleteLocation: (locationId: string) => api.delete(`/locations/${locationId}`),
  
  // Games
  getGames: (filters?: {
    locationId?: string;
    status?: string;
    skillLevel?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.locationId) params.append('locationId', filters.locationId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.skillLevel) params.append('skillLevel', filters.skillLevel);
    const queryString = params.toString();
    return api.get(`/games${queryString ? '?' + queryString : ''}`);
  },
  getGameById: (gameId: string) => api.get(`/games/${gameId}`),
  getNearbyGames: (latitude: number, longitude: number, radius = 10) => 
    api.get(`/games/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`),
  createGame: (game: {
    locationId: string;
    title: string;
    scheduledTime: string;
    duration: number;
    maxPlayers: number;
    skillLevel?: string;
    description?: string;
  }) => api.post('/games', game),
  updateGame: (gameId: string, updates: {
    title?: string;
    scheduledTime?: string;
    duration?: number;
    maxPlayers?: number;
    skillLevel?: string;
    description?: string;
    status?: string;
  }) => api.put(`/games/${gameId}`, updates),
  deleteGame: (gameId: string) => api.delete(`/games/${gameId}`),
  joinGame: (gameId: string) => api.post(`/games/${gameId}/join`),
  leaveGame: (gameId: string) => api.post(`/games/${gameId}/leave`),
  
  // User games - these will help with MyGamesScreen
  getUserGames: async () => {
    // Get all games and then filter by user participation
    const gamesResponse = await api.get('/games');
    return gamesResponse;
  }
};

export default api;
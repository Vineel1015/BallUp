import axios from 'axios';
import { CONFIG } from '../config/environment';
import { tokenStorage } from './tokenStorage';

const API_BASE_URL = CONFIG.API_BASE_URL;

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
  // Locations
  getLocations: () => api.get('/locations'),
  createLocation: (location: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    description?: string;
    amenities: string[];
  }) => api.post('/locations', location),
  
  // Games
  getGames: () => api.get('/games'),
  getGamesByLocation: (locationId: string) => api.get(`/games?locationId=${locationId}`),
  getNearbyGames: (latitude: number, longitude: number, radius = 10) => 
    api.get(`/games/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`),
  joinGame: (gameId: string) => api.post(`/games/${gameId}/join`),
  leaveGame: (gameId: string) => api.post(`/games/${gameId}/leave`),
  createGame: (game: {
    locationId: string;
    title: string;
    description?: string;
    dateTime: string;
    maxPlayers: number;
    skillLevel: string;
  }) => api.post('/games', game),
};

export default api;
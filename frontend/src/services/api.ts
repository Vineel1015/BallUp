import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  authToken = null;
  delete api.defaults.headers.common['Authorization'];
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
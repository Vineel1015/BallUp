export interface User {
  id: string;
  email: string;
  username: string;
  profilePicture?: string;
  skillLevel?: string;
  preferredPosition?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  amenities: string[];
  photos: string[];
  rating?: number;
  isVerified: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  locationId: string;
  creatorId: string;
  scheduledTime: string;
  duration: number;
  maxPlayers: number;
  currentPlayers: number;
  skillLevelRequired?: string;
  description?: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  location?: Location;
  creator?: User;
  participants?: GameParticipant[];
}

export interface GameParticipant {
  id: string;
  gameId: string;
  userId: string;
  joinedAt: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  user?: User;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}
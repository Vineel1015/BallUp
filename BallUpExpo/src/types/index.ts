export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  skillLevel: string;
  preferredPosition?: string;
  bio?: string;
  isVerified: boolean;
  isActive: boolean;
  role: string;
  
  // Location preferences
  latitude?: number;
  longitude?: number;
  locationRadius: number;
  
  // Stats
  gamesPlayed: number;
  gamesCreated: number;
  rating: number;
  totalRatings: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  description?: string;
  latitude: number;
  longitude: number;
  
  // Court details
  courtType: string;
  surfaceType: string;
  hoopCount: number;
  amenities: string[];
  photos: string[];
  
  // Status and approval
  isActive: boolean;
  isVerified: boolean;  
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  
  // Ratings and usage
  rating: number;
  totalRatings: number;
  totalGames: number;
  
  // Timestamps
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  creator?: User;
}

export interface Game {
  id: string;
  title: string;
  description?: string;
  
  // Game details
  skillLevel?: string;
  maxPlayers: number;
  currentPlayers: number;
  gameType: string;
  duration?: number;
  
  // Timing
  scheduledAt: string; // This maps to backend scheduledAt
  startedAt?: string;
  endedAt?: string;
  
  // Status
  status: 'scheduled' | 'starting' | 'active' | 'completed' | 'cancelled';
  isPrivate: boolean;
  requiresApproval: boolean;
  
  // Relations
  locationId: string;
  creatorId: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Relations
  location?: Location;
  creator?: User;
  participants?: GameParticipant[];
  
  // Legacy fields for backward compatibility
  scheduledTime?: string; // Maps to scheduledAt
  skillLevelRequired?: string; // Maps to skillLevel
}

export interface GameParticipant {
  id: string;
  gameId: string;
  userId: string;
  joinedAt: string;
  leftAt?: string;
  status: 'joined' | 'left' | 'kicked' | 'no_show';
  
  // Relations
  game?: Game;
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
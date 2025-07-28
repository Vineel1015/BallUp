import { useState, useEffect, useCallback } from 'react';
import { Game, Location } from '../types';
import { apiService } from '../services/api';
import { Coordinates, calculateDistance } from '../services/locationService';
import { MAPS_CONFIG } from '../config/maps';

interface UseMapDataProps {
  userLocation?: Coordinates;
  radius?: number;
}

interface MapData {
  games: Game[];
  locations: Location[];
  loading: boolean;
  error: string | null;
}

export const useMapData = ({ userLocation, radius = MAPS_CONFIG.SEARCH.radius }: UseMapDataProps = {}) => {
  const [data, setData] = useState<MapData>({
    games: [],
    locations: [],
    loading: true,
    error: null,
  });

  const loadMapData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      let gamesResponse, locationsResponse;
      
      if (userLocation) {
        // Load nearby games if we have user location
        [gamesResponse, locationsResponse] = await Promise.all([
          apiService.getNearbyGames(userLocation.latitude, userLocation.longitude, radius),
          apiService.getLocations(),
        ]);
      } else {
        // Load all games and locations
        [gamesResponse, locationsResponse] = await Promise.all([
          apiService.getGames(),
          apiService.getLocations(),
        ]);
      }
      
      let gamesList = gamesResponse.data;
      const locationsList = locationsResponse.data;
      
      // Sort by distance if we have user location
      if (userLocation) {
        gamesList = gamesList
          .map((game: Game) => ({
            ...game,
            distance: game.location ? calculateDistance(userLocation, {
              latitude: game.location.latitude,
              longitude: game.location.longitude,
            }) : Infinity,
          }))
          .sort((a: any, b: any) => a.distance - b.distance)
          .slice(0, MAPS_CONFIG.PERFORMANCE.markerLimit); // Limit for performance
      }
      
      setData({
        games: gamesList,
        locations: locationsList,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading map data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load map data',
      }));
      
      // Fallback to mock data
      loadMockData();
    }
  }, [userLocation, radius]);

  const loadMockData = () => {
    const mockGames: Game[] = [
      {
        id: '1',
        locationId: '1',
        title: 'Pickup Game at Central Park',
        description: 'Casual basketball game',
        dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        maxPlayers: 10,
        currentPlayers: 6,
        skillLevel: 'intermediate',
        status: 'scheduled',
        players: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        location: {
          id: '1',
          name: 'Central Park Basketball Court',
          address: 'Central Park, New York, NY',
          latitude: 40.7831,
          longitude: -73.9712,
          description: 'Popular outdoor basketball court',
          amenities: ['outdoor', 'free'],
          photos: [],
          isVerified: true,
          createdBy: 'user1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      {
        id: '2',
        locationId: '2',
        title: 'Indoor Game at Community Center',
        description: 'Air conditioned court, competitive level',
        dateTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        maxPlayers: 8,
        currentPlayers: 4,
        skillLevel: 'advanced',
        status: 'scheduled',
        players: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        location: {
          id: '2',
          name: 'Downtown Community Center',
          address: '123 Main St, New York, NY',
          latitude: 40.7589,
          longitude: -73.9851,
          description: 'Modern indoor court with AC',
          amenities: ['indoor', 'parking', 'restrooms'],
          photos: [],
          isVerified: true,
          createdBy: 'user2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    ];
    
    setData({
      games: mockGames,
      locations: mockGames.map(game => game.location!),
      loading: false,
      error: null,
    });
  };

  const joinGame = async (gameId: string): Promise<boolean> => {
    try {
      await apiService.joinGame(gameId);
      // Refresh data after joining
      await loadMapData();
      return true;
    } catch (error) {
      console.error('Error joining game:', error);
      return false;
    }
  };

  const leaveGame = async (gameId: string): Promise<boolean> => {
    try {
      await apiService.leaveGame(gameId);
      // Refresh data after leaving
      await loadMapData();
      return true;
    } catch (error) {
      console.error('Error leaving game:', error);
      return false;
    }
  };

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  return {
    ...data,
    refresh: loadMapData,
    joinGame,
    leaveGame,
  };
};
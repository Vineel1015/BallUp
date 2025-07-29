import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Game, Location } from '../types';
import {
  getCurrentLocation,
  requestLocationPermission,
  Coordinates,
  formatDistance,
  calculateDistance,
} from '../services/locationService';
import { useMapData } from '../hooks/useMapData';
import { MAPS_CONFIG, MARKER_STYLES } from '../config/maps';

interface GameMapViewProps {
  onGameSelect?: (game: Game) => void;
  onLocationSelect?: (location: Location) => void;
  showCurrentLocation?: boolean;
  initialRegion?: Region;
}

const GameMapView: React.FC<GameMapViewProps> = React.memo(({
  onGameSelect,
  onLocationSelect,
  showCurrentLocation = true,
  initialRegion,
}) => {
  const [region, setRegion] = useState<Region>(
    initialRegion || MAPS_CONFIG.DEFAULT_REGION
  );
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const mapRef = useRef<MapView>(null);
  
  // Use the custom hook for data management
  const { games, locations, loading, error, refresh, joinGame } = useMapData({
    userLocation: currentLocation || undefined,
  });

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      if (showCurrentLocation) {
        const hasPermission = await requestLocationPermission();
        if (hasPermission) {
          const location = await getCurrentLocation();
          setCurrentLocation(location);
          setRegion({
            ...region,
            latitude: location.latitude,
            longitude: location.longitude,
          });
        }
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      Alert.alert('Error', 'Could not get your location. Showing default area.');
    }
  };

  const handleMarkerPress = (game: Game) => {
    setSelectedGame(game);
  };

  const handleJoinGame = async (gameId: string) => {
    const success = await joinGame(gameId);
    if (success) {
      Alert.alert('Success', 'You have joined the game!');
      setSelectedGame(null);
    } else {
      Alert.alert('Error', 'Could not join the game. Please try again.');
    }
  };

  const animateToLocation = (coordinates: Coordinates) => {
    mapRef.current?.animateToRegion({
      ...coordinates,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, MAPS_CONFIG.PERFORMANCE.animationDuration);
  };

  // Memoize markers for performance
  const gameMarkers = useMemo(() => {
    return games.map((game) => {
      if (!game.location) return null;
      
      const markerStyle = MARKER_STYLES[game.status] || MARKER_STYLES.scheduledGame;
      
      return (
        <Marker
          key={game.id}
          coordinate={{
            latitude: game.location.latitude,
            longitude: game.location.longitude,
          }}
          title={game.title}
          description={`${game.currentPlayers}/${game.maxPlayers} players`}
          onPress={() => handleMarkerPress(game)}
          pinColor={markerStyle.color}
        />
      );
    }).filter(Boolean);
  }, [games]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading nearby games...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Failed to load map data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={showCurrentLocation}
        showsMyLocationButton={showCurrentLocation}
        maxZoomLevel={MAPS_CONFIG.PERFORMANCE.maxZoomLevel}
        minZoomLevel={MAPS_CONFIG.PERFORMANCE.minZoomLevel}
      >
        {gameMarkers}
      </MapView>

      {selectedGame && (
        <Modal
          visible={true}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedGame(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.gameCard}>
              <ScrollView>
                <Text style={styles.gameTitle}>{selectedGame.title}</Text>
                <Text style={styles.gameLocation}>
                  {selectedGame.location?.name}
                </Text>
                <Text style={styles.gameDetails}>
                  {selectedGame.currentPlayers}/{selectedGame.maxPlayers} players
                </Text>
                <Text style={styles.gameDetails}>
                  Skill Level: {selectedGame.skillLevel}
                </Text>
                <Text style={styles.gameDetails}>
                  {new Date(selectedGame.dateTime).toLocaleDateString()} at{' '}
                  {new Date(selectedGame.dateTime).toLocaleTimeString()}
                </Text>
                {selectedGame.description && (
                  <Text style={styles.gameDescription}>
                    {selectedGame.description}
                  </Text>
                )}
                {currentLocation && selectedGame.location && (
                  <Text style={styles.distance}>
                    Distance: {formatDistance(
                      calculateDistance(currentLocation, {
                        latitude: selectedGame.location.latitude,
                        longitude: selectedGame.location.longitude,
                      })
                    )}
                  </Text>
                )}
              </ScrollView>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setSelectedGame(null)}
                >
                  <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.joinButton]}
                  onPress={() => handleJoinGame(selectedGame.id)}
                >
                  <Text style={styles.joinButtonText}>Join Game</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  gameCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  gameLocation: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  gameDetails: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 6,
  },
  gameDescription: {
    fontSize: 14,
    color: '#34495e',
    marginTop: 12,
    fontStyle: 'italic',
  },
  distance: {
    fontSize: 14,
    color: '#e67e22',
    fontWeight: 'bold',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#e67e22',
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GameMapView;
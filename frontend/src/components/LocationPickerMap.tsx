import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import {
  getCurrentLocation,
  requestLocationPermission,
  Coordinates,
} from '../services/locationService';
import { searchLocation, reverseGeocode } from '../services/geocodingService';
import { MAPS_CONFIG } from '../config/maps';
import { debounce } from '../utils/debounce';

interface LocationPickerMapProps {
  onLocationSelect: (location: {
    coordinates: Coordinates;
    address: string;
  }) => void;
  initialLocation?: Coordinates;
}

const LocationPickerMap: React.FC<LocationPickerMapProps> = React.memo(({
  onLocationSelect,
  initialLocation,
}) => {
  const [region, setRegion] = useState<Region>(
    initialLocation ? {
      latitude: initialLocation.latitude,
      longitude: initialLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    } : MAPS_CONFIG.DEFAULT_REGION
  );
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(
    initialLocation || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        const location = await getCurrentLocation();
        setCurrentLocation(location);
        if (!initialLocation) {
          setRegion({
            ...region,
            latitude: location.latitude,
            longitude: location.longitude,
          });
        }
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  // Debounced reverse geocode function to prevent excessive API calls
  const debouncedReverseGeocode = useCallback(
    debounce(async (coordinates: Coordinates) => {
      try {
        setIsGeocodingLoading(true);
        const address = await reverseGeocode(coordinates.latitude, coordinates.longitude);
        
        onLocationSelect({
          coordinates,
          address,
        });
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        onLocationSelect({
          coordinates,
          address: `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`,
        });
      } finally {
        setIsGeocodingLoading(false);
      }
    }, 500), // 500ms delay to prevent excessive calls
    [onLocationSelect]
  );

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    
    // Immediately show the selected location, but debounce the reverse geocoding
    onLocationSelect({
      coordinates: coordinate,
      address: `${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`,
    });
    
    // This will be debounced
    debouncedReverseGeocode(coordinate);
  };

  const handleReverseGeocode = async (coordinates: Coordinates) => {
    try {
      setIsGeocodingLoading(true);
      const address = await reverseGeocode(coordinates.latitude, coordinates.longitude);
      
      onLocationSelect({
        coordinates,
        address,
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      onLocationSelect({
        coordinates,
        address: `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`,
      });
    } finally {
      setIsGeocodingLoading(false);
    }
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a location to search');
      return;
    }
    
    try {
      const results = await searchLocation(searchQuery);
      
      if (results.length > 0) {
        const firstResult = results[0];
        const newRegion = {
          latitude: firstResult.latitude,
          longitude: firstResult.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        
        setRegion(newRegion);
        const newLocation = {
          latitude: firstResult.latitude,
          longitude: firstResult.longitude,
        };
        setSelectedLocation(newLocation);
        
        // Use the debounced reverse geocoding for consistency
        debouncedReverseGeocode(newLocation);
        
        mapRef.current?.animateToRegion(newRegion);
      } else {
        Alert.alert('Not Found', 'Could not find that location. Try a different search term.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      Alert.alert('Error', 'Failed to search for location. Please try again.');
    }
  };

  const animateToCurrentLocation = async () => {
    if (currentLocation) {
      mapRef.current?.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      try {
        const location = await getCurrentLocation();
        setCurrentLocation(location);
        mapRef.current?.animateToRegion({
          ...location,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        Alert.alert('Error', 'Could not get your current location');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchLocation}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchLocation}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Selected Location"
            description="Tap to select this location"
          />
        )}
      </MapView>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={animateToCurrentLocation}
        >
          <Text style={styles.buttonText}>📍 My Location</Text>
        </TouchableOpacity>
        
        {selectedLocation && (
          <View style={styles.selectedLocationContainer}>
            <Text style={styles.selectedLocationText}>
              Selected: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
            </Text>
            {isGeocodingLoading && (
              <View style={styles.geocodingLoadingContainer}>
                <ActivityIndicator size="small" color="#FF6B35" />
                <Text style={styles.geocodingLoadingText}>Getting address...</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    gap: 8,
  },
  currentLocationButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedLocationText: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default LocationPickerMap;
export const MAPS_CONFIG = {
  // Default region for maps (New York City area)
  DEFAULT_REGION: {
    latitude: 40.7831,
    longitude: -73.9712,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  
  // Map providers
  PROVIDERS: {
    OPENSTREETMAP: 'openstreetmap', // FREE - No API key required
    GOOGLE: 'google',              // Paid - Requires API key
    MAPBOX: 'mapbox',             // Free tier: 50k loads/month
  },
  
  // Default to free OpenStreetMap
  DEFAULT_PROVIDER: 'openstreetmap',
  
  // Map style configurations (for Google Maps)
  GOOGLE_MAP_STYLE: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
  
  // Performance settings
  PERFORMANCE: {
    maxZoomLevel: 18,
    minZoomLevel: 10,
    animationDuration: 300,
    markerLimit: 50, // Maximum markers to show at once
  },
  
  // Search settings
  SEARCH: {
    radius: 10, // km
    debounceDelay: 300, // ms
  },
  
  // Clustering settings for performance
  CLUSTERING: {
    enabled: true,
    radius: 50,
    maxZoom: 15,
  },
};

export const MAP_THEMES = {
  light: [],
  dark: [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  ],
};

// Custom marker styles for different game types
export const MARKER_STYLES = {
  activeGame: {
    color: '#FF6B35',
    size: 'large',
  },
  scheduledGame: {
    color: '#3498db',
    size: 'medium',
  },
  completedGame: {
    color: '#95a5a6',
    size: 'small',
  },
};
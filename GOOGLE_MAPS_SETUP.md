# Maps Setup Guide - Free & Low-Cost Options

This guide explains how to set up maps for the BallUp basketball app using free and cost-effective alternatives.

## 🆓 **FREE Options (Recommended)**

### Option 1: OpenStreetMap with react-native-maps (Completely Free)
- **Cost**: $0 forever
- **Limits**: None
- **Features**: Full mapping, markers, user location
- **Best for**: Most use cases, unlimited usage

### Option 2: MapBox (Generous Free Tier)
- **Cost**: Free for up to 50,000 map loads/month
- **Features**: Superior styling, offline maps, navigation
- **Best for**: Apps expecting moderate usage

### Option 3: Google Maps (Limited Free Usage)
- **Cost**: $200/month free credit (≈28,000 map loads)
- **Features**: Most comprehensive, best geocoding
- **Best for**: Apps needing advanced features

## 💰 **Cost Comparison**

| Provider | Free Tier | Cost After Free Tier |
|----------|-----------|---------------------|
| OpenStreetMap | Unlimited | $0 |
| MapBox | 50,000 loads/month | $0.50 per 1,000 loads |
| Google Maps | $200 credit/month | $7 per 1,000 loads |

## 🚀 **Recommended Setup: OpenStreetMap (FREE)**

### Prerequisites (Free Option)
1. No API keys required
2. No billing setup needed
3. Works with existing react-native-maps

## 🆓 **Setup Instructions (Free OpenStreetMap)**

### Android Configuration (FREE)

Add permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

### iOS Configuration (FREE)

Add location permissions to `ios/BallUp/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>BallUp needs access to your location to show nearby basketball games and courts.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>BallUp uses your location to help you find and join nearby basketball games.</string>
```

### Free Geocoding Alternative

For address lookup, we'll use the free Nominatim API (OpenStreetMap's geocoding service):

```bash
# No API key required!
# Example: https://nominatim.openstreetmap.org/search?format=json&q=Central+Park+New+York
```

## 🗺️ **Alternative Setups**

### MapBox Setup (50,000 free loads/month)

1. Create account at [mapbox.com](https://www.mapbox.com/)
2. Get your free API token
3. Add to your app:

```bash
# backend/.env
MAPBOX_ACCESS_TOKEN=your-mapbox-token-here
```

### Google Maps Setup (If you prefer Google)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API
3. Create API key with restrictions
4. Add to Android manifest:

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="your-google-maps-api-key-here" />
```

## 🚀 **Installation Commands (FREE Setup)**

Run these commands to install the required dependencies:

```bash
# Navigate to frontend directory
cd frontend

# Install the geolocation dependency (only dependency needed for free setup!)
npm install @react-native-community/geolocation

# For iOS, install pods
cd ios && pod install && cd ..

# For Android, no additional steps needed (auto-linking)
```

## ✨ **What You Get for FREE**

✅ **Unlimited map loads** - No API limits or costs
✅ **Interactive maps** - Zoom, pan, markers, user location  
✅ **Location search** - Find places by name (1 second rate limit)
✅ **Reverse geocoding** - Get addresses from coordinates
✅ **All map features** - Everything works without API keys

## 🔄 **Switching Between Providers**

If you want to switch to a paid provider later, just change the configuration:

```typescript
// frontend/src/config/maps.ts
export const MAPS_CONFIG = {
  // Change this to switch providers
  DEFAULT_PROVIDER: 'openstreetmap', // Free option
  // DEFAULT_PROVIDER: 'google',     // Paid option
  // DEFAULT_PROVIDER: 'mapbox',     // Free tier option
};
```

## 🎯 **Features Implemented (All FREE!)**

### 1. Interactive Game Discovery Map
- **File**: `frontend/src/components/MapView.tsx`
- **Features**: 
  - 🗺️ Interactive map using OpenStreetMap (free)
  - 📍 Shows nearby basketball games as markers
  - 👆 Click markers to see game details and join
  - 📱 Shows your current location
  - ⚡ Optimized performance with marker limits
  - 🔄 Loading states and error handling

### 2. Smart Location Selection
- **File**: `frontend/src/components/LocationPickerMap.tsx` 
- **Features**:
  - 🎯 Tap anywhere on map to select court location
  - 🔍 Search for places by name (free via Nominatim API)
  - 📍 Current location detection
  - 🏀 Seamless integration with court creation

### 3. Enhanced Game Search
- **File**: `frontend/src/screens/GameSearchScreen.tsx`
- **Features**:
  - 📋 Toggle between list and map view
  - 📏 Distance-based game sorting  
  - 🎯 Real-time location updates
  - 🔍 Search games by location or description

### 4. Free Geocoding Service
- **File**: `frontend/src/services/geocodingService.ts`
- **Features**:
  - 🆓 Address search via OpenStreetMap Nominatim API
  - 🔄 Reverse geocoding (coordinates → address)
  - ⏰ Built-in rate limiting (respects 1 req/sec limit)
  - 🚫 No API keys required!

### 5. Performance Optimizations
- **Files**: `frontend/src/config/maps.ts`, `frontend/src/hooks/useMapData.ts`
- **Features**:
  - 📊 Marker clustering for smooth performance
  - 🧠 Memoized map components  
  - 🎛️ Configurable zoom levels and limits
  - 🔄 Optimized data loading with custom hooks

## API Integration

The app integrates with your backend APIs:

- `GET /api/games/nearby?lat={lat}&lng={lng}&radius={radius}` - Get nearby games
- `GET /api/locations` - Get all court locations
- `POST /api/games/{id}/join` - Join a game
- `POST /api/locations` - Create new court location

## Configuration Options

### Map Performance Settings

```typescript
// frontend/src/config/maps.ts
export const GOOGLE_MAPS_CONFIG = {
  PERFORMANCE: {
    maxZoomLevel: 18,
    minZoomLevel: 10,
    animationDuration: 300,
    markerLimit: 50, // Maximum markers to show at once
  },
  
  SEARCH: {
    radius: 10, // km
    debounceDelay: 300, // ms
  },
};
```

### Custom Marker Styles

```typescript
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
```

## Testing

1. **Test location permissions**: Make sure location permissions are granted
2. **Test map loading**: Verify maps load correctly on both iOS and Android
3. **Test markers**: Ensure game markers appear and are clickable
4. **Test search**: Verify location search functionality works
5. **Test API integration**: Confirm real API calls work (vs mock data)

## Troubleshooting

### Common Issues

1. **Map not loading**: Check API key configuration and billing account
2. **Location not detected**: Verify permissions in device settings
3. **Markers not appearing**: Check API responses and data structure
4. **Performance issues**: Reduce marker limit in configuration

### Debug Mode

Enable debug logging by setting:

```typescript
// In your component
console.log('Map data:', { games, locations, loading, error });
```

## Security Best Practices

1. **Restrict API keys**: Limit API key usage to your app bundle/package
2. **Environment variables**: Never commit API keys to version control
3. **Rate limiting**: Implement proper rate limiting for map API calls
4. **User permissions**: Always request location permissions properly

## Next Steps

1. Add Google Places Autocomplete for location search
2. Implement route directions to courts
3. Add traffic information overlay
4. Implement offline map caching
5. Add custom map markers with game status icons
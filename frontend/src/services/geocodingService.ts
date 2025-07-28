// Free geocoding service using OpenStreetMap's Nominatim API
// No API key required!

interface GeocodingResult {
  latitude: number;
  longitude: number;
  address: string;
  displayName: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Add delay to respect rate limits (max 1 request per second)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const searchLocation = async (query: string): Promise<GeocodingResult[]> => {
  try {
    // Add delay to respect Nominatim usage policy
    await delay(1000);
    
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BallUp Basketball App', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const results: NominatimResult[] = await response.json();
    
    return results.map(result => ({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: formatAddress(result.address),
      displayName: result.display_name,
    }));
  } catch (error) {
    console.error('Error searching location:', error);
    return [];
  }
};

export const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Add delay to respect rate limits
    await delay(1000);
    
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BallUp Basketball App',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }

    const result: NominatimResult = await response.json();
    
    return formatAddress(result.address) || result.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};

const formatAddress = (address?: NominatimResult['address']): string => {
  if (!address) return '';
  
  const parts = [
    address.house_number,
    address.road,
    address.city,
    address.state,
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Alternative paid geocoding services (if you need more features)
export const geocodingProviders = {
  // Free option (current implementation)
  nominatim: {
    search: searchLocation,
    reverse: reverseGeocode,
    cost: 'Free',
    rateLimit: '1 request/second',
  },
  
  // Paid alternatives (implement if needed)
  google: {
    // Requires GOOGLE_MAPS_API_KEY
    cost: '$0.005 per request',
    rateLimit: '50 requests/second',
  },
  
  mapbox: {
    // Requires MAPBOX_ACCESS_TOKEN
    cost: 'Free for 100k requests/month',
    rateLimit: '600 requests/minute',
  },
};
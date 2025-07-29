// Secure token storage service for BallUp
// TODO: Install @react-native-async-storage/async-storage for production

// WARNING: This is a temporary implementation
// In production, you MUST install and use AsyncStorage or Keychain Services
let tempTokenStore: string | null = null;

export const tokenStorage = {
  // Store authentication token securely
  setToken: async (token: string): Promise<void> => {
    try {
      // TODO: Replace with AsyncStorage in production
      // await AsyncStorage.setItem('ballup_auth_token', token);
      tempTokenStore = token;
      console.warn('WARNING: Using temporary token storage. Install AsyncStorage for production!');
    } catch (error) {
      console.error('Failed to store token:', error);
      throw new Error('Failed to store authentication token');
    }
  },

  // Retrieve authentication token
  getToken: async (): Promise<string | null> => {
    try {
      // TODO: Replace with AsyncStorage in production
      // return await AsyncStorage.getItem('ballup_auth_token');
      return tempTokenStore;
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  },

  // Remove authentication token
  removeToken: async (): Promise<void> => {
    try {
      // TODO: Replace with AsyncStorage in production
      // await AsyncStorage.removeItem('ballup_auth_token');
      tempTokenStore = null;
    } catch (error) {
      console.error('Failed to remove token:', error);
      throw new Error('Failed to remove authentication token');
    }
  },

  // Check if token exists
  hasToken: async (): Promise<boolean> => {
    try {
      const token = await tokenStorage.getToken();
      return token !== null && token !== '';
    } catch (error) {
      console.error('Failed to check token existence:', error);
      return false;
    }
  }
};

export default tokenStorage;

/* 
PRODUCTION SETUP INSTRUCTIONS:
1. Install AsyncStorage: npm install @react-native-async-storage/async-storage
2. Import: import AsyncStorage from '@react-native-async-storage/async-storage';
3. Replace tempTokenStore with AsyncStorage calls
4. For iOS, consider using Keychain Services for enhanced security
5. For Android, consider using EncryptedSharedPreferences
*/
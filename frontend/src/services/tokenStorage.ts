// Secure token storage service for BallUp
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'ballup_auth_token';

export const tokenStorage = {
  // Store authentication token securely
  setToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store token:', error);
      throw new Error('Failed to store authentication token');
    }
  },

  // Retrieve authentication token
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  },

  // Remove authentication token
  removeToken: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
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
PRODUCTION NOTES:
- AsyncStorage is now properly implemented
- For enhanced security in sensitive applications, consider:
  * iOS: Keychain Services for storing tokens
  * Android: EncryptedSharedPreferences
  * JWT token rotation and refresh mechanisms
*/
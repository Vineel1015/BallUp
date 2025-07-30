import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'ballup_auth_token';

export const tokenStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token from storage:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token in storage:', error);
      throw error;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token from storage:', error);
      throw error;
    }
  },

  async hasToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error('Error checking token existence:', error);
      return false;
    }
  }
};
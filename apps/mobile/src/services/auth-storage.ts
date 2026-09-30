import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "apartment_resident_auth_token";
const USER_KEY = "apartment_resident_auth_user";

// In-memory fallback for environments without SecureStore
let memoryStore: Record<string, string> = {};

/**
 * Encrypted Token and Session Persistence
 * Uses hardware keystore/keychain via expo-secure-store on iOS & Android.
 */
export const authStorage = {
  async saveToken(token: string): Promise<void> {
    try {
      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } else if (typeof localStorage !== "undefined") {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        memoryStore[TOKEN_KEY] = token;
      }
    } catch (e) {
      memoryStore[TOKEN_KEY] = token;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS !== "web") {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      } else if (typeof localStorage !== "undefined") {
        return localStorage.getItem(TOKEN_KEY);
      }
      return memoryStore[TOKEN_KEY] || null;
    } catch {
      return memoryStore[TOKEN_KEY] || null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (Platform.OS !== "web") {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } else if (typeof localStorage !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
      }
      delete memoryStore[TOKEN_KEY];
    } catch {
      delete memoryStore[TOKEN_KEY];
    }
  },

  async saveUserData(userData: string): Promise<void> {
    try {
      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync(USER_KEY, userData);
      } else if (typeof localStorage !== "undefined") {
        localStorage.setItem(USER_KEY, userData);
      } else {
        memoryStore[USER_KEY] = userData;
      }
    } catch {
      memoryStore[USER_KEY] = userData;
    }
  },

  async getUserData(): Promise<string | null> {
    try {
      if (Platform.OS !== "web") {
        return await SecureStore.getItemAsync(USER_KEY);
      } else if (typeof localStorage !== "undefined") {
        return localStorage.getItem(USER_KEY);
      }
      return memoryStore[USER_KEY] || null;
    } catch {
      return memoryStore[USER_KEY] || null;
    }
  },

  async clearAll(): Promise<void> {
    await this.removeToken();
    try {
      if (Platform.OS !== "web") {
        await SecureStore.deleteItemAsync(USER_KEY);
      } else if (typeof localStorage !== "undefined") {
        localStorage.removeItem(USER_KEY);
      }
      delete memoryStore[USER_KEY];
    } catch {
      delete memoryStore[USER_KEY];
    }
  }
};

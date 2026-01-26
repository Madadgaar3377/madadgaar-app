import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

/**
 * API service configuration
 * Base URL and interceptors for token handling
 */
export const api = axios.create({
  baseURL: 'https://api.madadgaar.com.pk/api',
  timeout: 30000, // Increased timeout for image uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - automatically attach Bearer token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        // Always set Authorization header with Bearer token
        config.headers.Authorization = `Bearer ${token}`;
      } else {
      }
      
      // For FormData requests, don't set Content-Type - let axios handle it with boundary
      if (config.data instanceof FormData) {
        // Remove Content-Type so axios can set it with the boundary
        delete config.headers['Content-Type'];
        // Also remove it from common headers
        if (config.headers.common) {
          delete config.headers.common['Content-Type'];
        }
      }
      
      // Ensure Authorization header is preserved even if headers are explicitly set
      if (config.headers && token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Token retrieval failed, continue without token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized
      try {
        await SecureStore.deleteItemAsync('authToken');
      } catch (e) {
        // Ignore errors
      }
    }
    return Promise.reject(error);
  }
);


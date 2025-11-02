import { useContext } from 'react';
import { LiffContext } from '../App';

/**
 * Custom hook to access LIFF user data
 * Returns user login status, userId, displayName, pictureUrl, and LIFF ready status
 */
export const useLiff = () => {
  const context = useContext(LiffContext);
  
  if (context === undefined) {
    throw new Error('useLiff must be used within a LiffContext.Provider');
  }
  
  return context;
};

/**
 * Get userId from LIFF context or localStorage
 * Useful for components that need userId for data storage
 */
export const getUserId = (): string | null => {
  // Try to get from localStorage first (for persistence)
  const storedUserId = localStorage.getItem('liff_userId');
  if (storedUserId) {
    return storedUserId;
  }
  
  return null;
};

/**
 * Get user-specific storage key
 * Ensures each user has their own data in localStorage
 */
export const getUserStorageKey = (key: string): string => {
  const userId = getUserId();
  return userId ? `${userId}_${key}` : key;
};

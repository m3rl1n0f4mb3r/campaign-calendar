import { useCallback } from 'react';

export function useDomainStorage() {
  const STORAGE_KEY = 'shadowdark-domain-data';

  const loadDomainData = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading domain data:', error);
      return {};
    }
  }, []);

  const saveDomainData = useCallback((data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving domain data:', error);
    }
  }, []);

  return [loadDomainData(), saveDomainData];
}

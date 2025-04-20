import { useState, useRef, useCallback } from 'react';

export default function usePokemonDetails() {
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const detailsCache = useRef({});
  const abortControllerRef = useRef(null);
  const pendingRequestRef = useRef(null);

  const selectPokemon = useCallback((pokemon) => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear any pending timeout
    if (pendingRequestRef.current) {
      clearTimeout(pendingRequestRef.current);
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setLoadingDetails(true);
    const name = pokemon.name;
    const storageKey = 'pokemonDetails_' + name;
    
    // Slight delay before processing to allow for cancellation if rapid clicks occur
    pendingRequestRef.current = setTimeout(() => {
      // First check memory cache
      if (detailsCache.current[name]) {
        setDetails(detailsCache.current[name]);
        setLoadingDetails(false);
        return;
      }
      
      // Then check localStorage
      try {
        const cachedStorage = localStorage.getItem(storageKey);
        if (cachedStorage) {
          const data = JSON.parse(cachedStorage);
          if (data) {
            detailsCache.current[name] = data;
            setDetails(data);
            setLoadingDetails(false);
            
            // Preload image in background to ensure it's cached
            new Image().src = data.sprites.other['official-artwork'].front_default;
            return;
          }
        }
      } catch (e) {
        console.warn('Error reading from localStorage:', e);
      }
      
      // Finally, fetch from API
      fetch(pokemon.url, { signal })
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch details for ${name}`);
          return res.json();
        })
        .then(data => {
          detailsCache.current[name] = data;
          
          try {
            localStorage.setItem(storageKey, JSON.stringify(data));
          } catch (e) {
            console.warn('Error saving to localStorage:', e);
          }
          
          // Preload image
          new Image().src = data.sprites.other['official-artwork'].front_default;
          
          // Update state
          setDetails(data);
          setLoadingDetails(false);
        })
        .catch(err => {
          // Only show error if it's not an abort error (which we expect when canceling)
          if (err.name !== 'AbortError') {
            console.error(`Error fetching Pokémon details for ${name}:`, err);
            setLoadingDetails(false);
          }
        });
    }, 100); // Small delay to handle rapid clicks
  }, []);

  const clearSelection = useCallback(() => {
    // Cancel any pending request when clearing selection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (pendingRequestRef.current) {
      clearTimeout(pendingRequestRef.current);
    }
    
    setDetails(null);
  }, []);

  return { details, loadingDetails, selectPokemon, clearSelection };
}
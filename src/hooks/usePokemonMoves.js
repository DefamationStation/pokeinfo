import { useState, useEffect, useRef } from 'react';

// Module-level aggregated cache of moves per Pokémon
const aggregatedCache = {};

export default function usePokemonMoves(pokemonName, moves) {
  const [moveDetails, setMoveDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const abortRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    // Set up cleanup for component unmount
    return () => {
      isMounted.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  useEffect(() => {
    if (!pokemonName || !moves?.length) {
      setMoveDetails({});
      setLoading(false);
      setFetchProgress(100);
      return;
    }
    
    // Function to check if we already have complete data in cache
    const checkForImmediateCache = () => {
      const storageKey = `pokemonMoves_${pokemonName}`;
      
      // Check in-memory aggregated cache first (fastest)
      if (aggregatedCache[pokemonName]) {
        const cacheValid = moves.every(m => 
          aggregatedCache[pokemonName][m.move.name]
        );
        
        if (cacheValid) {
          setMoveDetails(aggregatedCache[pokemonName]);
          setLoading(false);
          setFetchProgress(100);
          return true;
        }
      }
      
      // Check localStorage next
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsedData = JSON.parse(stored);
          if (parsedData && typeof parsedData === 'object') {
            const cacheValid = moves.every(m => 
              parsedData[m.move.name]
            );
            
            if (cacheValid) {
              aggregatedCache[pokemonName] = parsedData;
              setMoveDetails(parsedData);
              setLoading(false);
              setFetchProgress(100);
              return true;
            }
          }
        }
      } catch (e) {
        console.warn(`Quick cache check failed for ${storageKey}:`, e);
      }
      
      return false;
    };
    
    // If we have a complete cache, use it immediately without showing loading state
    if (checkForImmediateCache()) {
      return;
    }
    
    // Otherwise, reset state for new loading process
    setLoading(true);
    setFetchProgress(0);

    // Cancel any in-flight fetch
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    const storageKey = `pokemonMoves_${pokemonName}`;

    // Function to validate cached data
    const isValidCache = (data) => {
      if (!data || typeof data !== 'object') return false;
      
      // Check if we have details for all moves
      return moves.every(moveInfo => {
        const moveName = moveInfo.move.name;
        return data[moveName] && typeof data[moveName] === 'object';
      });
    };

    const loadMoveDetails = async () => {
      // This code should rarely execute due to the quick check above,
      // but we keep it as a fallback for thorough validation
      
      // 1) Check in-memory aggregated cache first
      if (aggregatedCache[pokemonName] && isValidCache(aggregatedCache[pokemonName])) {
        if (isMounted.current) {
          setMoveDetails(aggregatedCache[pokemonName]);
          setLoading(false);
          setFetchProgress(100);
        }
        return;
      }

      // 2) Check localStorage aggregated cache
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsedData = JSON.parse(stored);
          if (isValidCache(parsedData)) {
            aggregatedCache[pokemonName] = parsedData;
            if (isMounted.current) {
              setMoveDetails(parsedData);
              setLoading(false);
              setFetchProgress(100);
            }
            return;
          }
        }
      } catch (e) {
        console.warn(`Error reading ${storageKey} from localStorage:`, e);
      }

      // 3) Check for individual move caches
      const details = {};
      let cachedCount = 0;
      
      for (const moveInfo of moves) {
        const moveName = moveInfo.move.name;
        const moveKey = `move_${moveName}`;
        
        // Try to get from localStorage
        try {
          const storedMove = localStorage.getItem(moveKey);
          if (storedMove) {
            const moveData = JSON.parse(storedMove);
            if (moveData && typeof moveData === 'object') {
              details[moveName] = moveData;
              cachedCount++;
              continue; // Skip fetch for this move
            }
          }
        } catch (e) {
          console.warn(`Error reading ${moveKey} from localStorage:`, e);
        }
      }

      // If we have all moves from individual caches, use that
      if (cachedCount === moves.length) {
        aggregatedCache[pokemonName] = details;
        try {
          localStorage.setItem(storageKey, JSON.stringify(details));
        } catch (e) {
          console.warn(`Error saving ${storageKey} to localStorage:`, e);
        }
        
        if (isMounted.current) {
          setMoveDetails(details);
          setLoading(false);
          setFetchProgress(100);
        }
        return;
      }

      // Update progress based on already cached moves
      if (isMounted.current && moves.length > 0) {
        setMoveDetails({...details});
        setFetchProgress((cachedCount / moves.length) * 100);
      }

      // 4) Fetch missing moves in batches
      const remainingMoves = moves.filter(mi => !details[mi.move.name]);
      const total = remainingMoves.length;
      const BATCH_SIZE = 10;
      const BATCH_DELAY = 300;

      for (let i = 0; i < total; i += BATCH_SIZE) {
        if (signal.aborted) break;
        
        const batch = remainingMoves.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (mi) => {
            if (signal.aborted) return;
            
            const moveName = mi.move.name;
            const moveKey = `move_${moveName}`;
            
            try {
              const res = await fetch(mi.move.url, { signal });
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              
              const data = await res.json();
              details[moveName] = data;
              
              // Save individual move cache
              try {
                localStorage.setItem(moveKey, JSON.stringify(data));
              } catch (e) {
                console.warn(`Error saving ${moveKey} to localStorage:`, e);
              }
            } catch (err) {
              if (err.name !== 'AbortError') {
                console.error(`Error fetching ${moveName}:`, err);
              }
            }
          })
        );
        
        // Update state progressively
        const progress = Math.min(
          ((cachedCount + Math.min(i + BATCH_SIZE, total)) / moves.length) * 100, 
          100
        );
        
        if (isMounted.current) {
          setMoveDetails({ ...details });
          setFetchProgress(progress);
        }
        
        if (i + BATCH_SIZE < total && !signal.aborted) {
          await new Promise(r => setTimeout(r, BATCH_DELAY));
        }
      }

      if (!signal.aborted) {
        // Save aggregate cache
        aggregatedCache[pokemonName] = details;
        try { 
          localStorage.setItem(storageKey, JSON.stringify(details)); 
        } catch (e) {
          console.warn(`Error saving ${storageKey} to localStorage:`, e);
        }
        
        if (isMounted.current) {
          setMoveDetails(details);
          setFetchProgress(100);
          setLoading(false);
        }
      }
    };

    // Start the loading process
    loadMoveDetails();

    // Cleanup function
    return () => controller.abort();
  }, [pokemonName, moves]);

  return { moveDetails, loading, fetchProgress };
}
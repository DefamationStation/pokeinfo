import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import typeColors from '../constants/typeColors';
import { getStatColor } from '../utils/stat';

const PokemonTable = ({ list, loading, onSelect }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [pokemonDetails, setPokemonDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [visiblePokemons, setVisiblePokemons] = useState([]);
  const abortControllerRef = useRef(null);
  const detailsCache = useRef({});
  
  // Extract Pokemon ID from URL
  const getPokemonId = (url) => {
    return parseInt(url.split('/').filter(Boolean).pop());
  };

  // Format name for display
  const formatName = (name) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get color class for type badge
  const getTypeColorClass = (type) => {
    return typeColors[type] || 'bg-gray-400 text-white';
  };

  // Get color class for stat value
  const getStatColorClass = (value) => {
    if (value < 50) return 'text-red-500';
    if (value < 80) return 'text-yellow-500';
    if (value < 120) return 'text-green-500';
    return 'text-blue-500';
  };
  
  // Get stat value from details
  const getStatValue = (details, statName) => {
    if (!details || !details.stats) return '-';
    const stat = details.stats.find(s => s.stat.name === statName);
    return stat ? stat.base_stat : '-';
  };

  // Handle sort
  const handleSort = useCallback((key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  // Get sort icon
  const getSortIcon = useCallback((key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  }, [sortConfig]);
  
  // Fetch Pokemon details in batches
  const fetchPokemonDetails = useCallback(async (pokemonList) => {
    if (!pokemonList || pokemonList.length === 0) return;
    
    // Cancel any previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;
    
    setLoadingDetails(true);
    
    // Prepare batch of Pokemon to fetch
    const pokemonToFetch = pokemonList.filter(p => !detailsCache.current[p.name]);
    
    if (pokemonToFetch.length === 0) {
      setLoadingDetails(false);
      return;
    }
    
    const batchSize = 10;
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    for (let i = 0; i < pokemonToFetch.length; i += batchSize) {
      if (signal.aborted) break;
      
      const batch = pokemonToFetch.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (pokemon) => {
        try {
          // First check localStorage
          const storageKey = `pokemonDetails_${pokemon.name}`;
          try {
            const cachedData = localStorage.getItem(storageKey);
            if (cachedData) {
              const data = JSON.parse(cachedData);
              if (data) {
                detailsCache.current[pokemon.name] = data;
                return;
              }
            }
          } catch (e) {
            console.warn('Error reading from localStorage:', e);
          }
          
          // Fetch if not in localStorage
          const response = await fetch(pokemon.url, { signal });
          if (!response.ok) throw new Error(`Failed to fetch details for ${pokemon.name}`);
          
          const data = await response.json();
          detailsCache.current[pokemon.name] = data;
          
          // Save to localStorage
          try {
            localStorage.setItem(storageKey, JSON.stringify(data));
          } catch (e) {
            console.warn('Error saving to localStorage:', e);
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error(`Error fetching details for ${pokemon.name}:`, error);
          }
        }
      }));
      
      // Update the details state
      setPokemonDetails({...detailsCache.current});
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < pokemonToFetch.length && !signal.aborted) {
        await delay(300);
      }
    }
    
    setLoadingDetails(false);
  }, []);
  
  // State to track how many Pokemon to show
  const [visibleCount, setVisibleCount] = useState(30);
  const tableRef = useRef(null);
  
  // Set visible pokemons based on sorted list and visible count
  useEffect(() => {
    if (!list || list.length === 0) return;
    setVisiblePokemons(sortedList.slice(0, visibleCount));
  }, [sortedList, visibleCount]);
  
  // Handle scroll to load more Pokemon
  const handleScroll = useCallback(() => {
    if (!tableRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    
    // If we're near the bottom (within 200px), load more
    if (scrollHeight - scrollTop - clientHeight < 200) {
      // Don't load more if we already have all Pokemon or if we're still loading
      if (visibleCount >= sortedList.length || loadingDetails) return;
      
      // Load next batch of Pokemon
      setVisibleCount(prev => Math.min(prev + 20, sortedList.length));
    }
  }, [visibleCount, sortedList.length, loadingDetails]);
  
  // Add scroll event listener
  useEffect(() => {
    const currentTableRef = tableRef.current;
    if (currentTableRef) {
      currentTableRef.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (currentTableRef) {
        currentTableRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);
  
  // Fetch details when visible pokemons change
  useEffect(() => {
    fetchPokemonDetails(visiblePokemons);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [visiblePokemons, fetchPokemonDetails]);

  // Sort the list
  const sortedList = React.useMemo(() => {
    if (!list || list.length === 0) return [];
    
    const sortableList = [...list];
    
    sortableList.sort((a, b) => {
      if (sortConfig.key === 'id') {
        const aId = getPokemonId(a.url);
        const bId = getPokemonId(b.url);
        return sortConfig.direction === 'ascending' ? aId - bId : bId - aId;
      }
      
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'ascending'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      
      // For types, we need to check if they exist first
      if (sortConfig.key === 'type') {
        const aType = a.types && a.types.length > 0 ? a.types[0].type.name : '';
        const bType = b.types && b.types.length > 0 ? b.types[0].type.name : '';
        return sortConfig.direction === 'ascending'
          ? aType.localeCompare(bType)
          : bType.localeCompare(aType);
      }
      
      // For stats, we need to get the values from details
      const statKeys = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
      if (statKeys.includes(sortConfig.key)) {
        const aDetails = detailsCache.current[a.name];
        const bDetails = detailsCache.current[b.name];
        
        // If we don't have details for both, keep original order
        if (!aDetails || !bDetails) return 0;
        
        const aStat = getStatValue(aDetails, sortConfig.key);
        const bStat = getStatValue(bDetails, sortConfig.key);
        
        // If either stat is missing, keep original order
        if (aStat === '-' || bStat === '-') return 0;
        
        return sortConfig.direction === 'ascending' 
          ? aStat - bStat 
          : bStat - aStat;
      }
      
      return 0;
    });
    
    return sortableList;
  }, [list, sortConfig, detailsCache.current]);

  if (loading) {
    return <p>Loading Pokémon...</p>;
  }

  // Add the return statement here
  return (
    <div className="pokemon-table-container">
      <div 
        ref={tableRef}
        className="pokemon-table-scroll-container"
      >
        <table className="pokemon-table">
          {/* Table content would go here */}
        </table>
        {loadingDetails && <p>Loading details...</p>}
      </div>
    </div>
  );
};

export default PokemonTable;
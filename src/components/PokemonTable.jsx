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
  const [visibleCount, setVisibleCount] = useState(30);
  const tableRef = useRef(null);
  
  // Extract Pokemon ID from URL
  const getPokemonId = useCallback((url) => {
    return parseInt(url.split('/').filter(Boolean).pop());
  }, []);

  // Format name for display
  const formatName = useCallback((name) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  // Get color class for type badge
  const getTypeColorClass = useCallback((type) => {
    return typeColors[type] || 'bg-gray-400 text-white';
  }, []);

  // Get color class for stat value
  const getStatColorClass = useCallback((value) => {
    if (value < 50) return 'text-red-500';
    if (value < 80) return 'text-yellow-500';
    if (value < 120) return 'text-green-500';
    return 'text-blue-500';
  }, []);
  
  // Get stat value from details
  const getStatValue = useCallback((details, statName) => {
    if (!details || !details.stats) return '-';
    const stat = details.stats.find(s => s.stat.name === statName);
    return stat ? stat.base_stat : '-';
  }, []);
  
  // Get total stat value
  const getTotalStats = useCallback((details) => {
    if (!details || !details.stats || !Array.isArray(details.stats)) return 0;
    return details.stats.reduce((total, stat) => total + stat.base_stat, 0);
  }, []);

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
  
  // Sort the list
  const sortedList = React.useMemo(() => {
    if (!list || list.length === 0) return [];
    
    const sortableList = [...list];
    
    return sortableList.sort((a, b) => {
      try {
        // ID sorting
        if (sortConfig.key === 'id') {
          const aId = getPokemonId(a.url);
          const bId = getPokemonId(b.url);
          return sortConfig.direction === 'ascending' ? aId - bId : bId - aId;
        }
        
        // Name sorting
        if (sortConfig.key === 'name') {
          return sortConfig.direction === 'ascending'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
        
        // Type sorting
        if (sortConfig.key === 'type') {
          const aType = a.types && a.types.length > 0 ? a.types[0].type.name : '';
          const bType = b.types && b.types.length > 0 ? b.types[0].type.name : '';
          return sortConfig.direction === 'ascending'
            ? aType.localeCompare(bType)
            : bType.localeCompare(aType);
        }
        
        // For normal stats
        const statKeys = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
        if (statKeys.includes(sortConfig.key)) {
          const aDetails = detailsCache.current[a.name];
          const bDetails = detailsCache.current[b.name];
          
          // If we don't have details for either, maintain original order
          if (!aDetails || !bDetails) return 0;
          
          const aStatValue = getStatValue(aDetails, sortConfig.key);
          const bStatValue = getStatValue(bDetails, sortConfig.key);
          
          // Convert to numbers for comparison, using 0 as fallback
          const aValue = aStatValue === '-' ? 0 : parseInt(aStatValue, 10) || 0;
          const bValue = bStatValue === '-' ? 0 : parseInt(bStatValue, 10) || 0;
          
          return sortConfig.direction === 'ascending' 
            ? aValue - bValue 
            : bValue - aValue;
        }
        
        // Total stat sorting
        if (sortConfig.key === 'total') {
          const aDetails = detailsCache.current[a.name];
          const bDetails = detailsCache.current[b.name];
          
          // If we don't have details for either, maintain original order
          if (!aDetails || !bDetails) return 0;
          
          // Get total stats with 0 as fallback
          const aTotal = getTotalStats(aDetails) || 0;
          const bTotal = getTotalStats(bDetails) || 0;
          
          return sortConfig.direction === 'ascending' 
            ? aTotal - bTotal 
            : bTotal - aTotal;
        }
      } catch (err) {
        console.error("Error during sorting:", err);
        return 0; // Default to no change in order if there's an error
      }
      
      // Default case
      return 0;
    });
  }, [list, sortConfig, getPokemonId, getStatValue, getTotalStats]);
  
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
  
  // Set visible pokemons based on sorted list and visible count
  useEffect(() => {
    if (!sortedList || sortedList.length === 0) return;
    setVisiblePokemons(sortedList.slice(0, visibleCount));
  }, [sortedList, visibleCount]);
  
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

  if (loading) {
    return <p>Loading Pokémon...</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg shadow">
      <div 
        ref={tableRef}
        className="max-h-[calc(100vh-200px)] overflow-x-auto overflow-y-auto"
      >
        <table className="w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th 
                scope="col" 
                className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-10"
                onClick={() => handleSort('id')}
              >
                # {getSortIcon('id')}
              </th>
              <th scope="col" className="px-2 py-2 w-8"></th>
              <th 
                scope="col" 
                className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-36"
                onClick={() => handleSort('name')}
              >
                Name {getSortIcon('name')}
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-32"
                onClick={() => handleSort('type')}
              >
                Type {getSortIcon('type')}
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-10"
                onClick={() => handleSort('hp')}
              >
                HP {getSortIcon('hp')}
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-10"
                onClick={() => handleSort('attack')}
              >
                Atk {getSortIcon('attack')}
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-10"
                onClick={() => handleSort('defense')}
              >
                Def {getSortIcon('defense')}
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-12"
                onClick={() => handleSort('special-attack')}
              >
                Sp.A {getSortIcon('special-attack')}
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-12"
                onClick={() => handleSort('special-defense')}
              >
                Sp.D {getSortIcon('special-defense')}
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-10"
                onClick={() => handleSort('speed')}
              >
                Spd {getSortIcon('speed')}
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-14"
                onClick={() => handleSort('total')}
              >
                Total {getSortIcon('total')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visiblePokemons.map((pokemon) => {
              const id = getPokemonId(pokemon.url);
              const details = detailsCache.current[pokemon.name];
              const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
              return (
                <tr 
                  key={pokemon.name}
                  onClick={() => onSelect(pokemon)}
                  className="hover:bg-gray-100 cursor-pointer"
                >
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                    #{id}
                  </td>
                  <td className="px-1 py-1 whitespace-nowrap">
                    <img src={spriteUrl} alt={pokemon.name} className="w-6 h-6" />
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs font-medium text-gray-900 capitalize">
                    {pokemon.name}
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                    {pokemon.types && pokemon.types.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {pokemon.types.map((typeObj) => (
                          <span
                            key={typeObj.type.name}
                            className={`px-1.5 py-0.5 text-xs rounded capitalize ${getTypeColorClass(typeObj.type.name)}`}
                          >
                            {typeObj.type.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">...</span>
                    )}
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                    <span className={details ? getStatColorClass(getStatValue(details, 'hp')) : ''}>
                      {details ? getStatValue(details, 'hp') : '-'}
                    </span>
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                    <span className={details ? getStatColorClass(getStatValue(details, 'attack')) : ''}>
                      {details ? getStatValue(details, 'attack') : '-'}
                    </span>
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                    <span className={details ? getStatColorClass(getStatValue(details, 'defense')) : ''}>
                      {details ? getStatValue(details, 'defense') : '-'}
                    </span>
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                    <span className={details ? getStatColorClass(getStatValue(details, 'special-attack')) : ''}>
                      {details ? getStatValue(details, 'special-attack') : '-'}
                    </span>
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                    <span className={details ? getStatColorClass(getStatValue(details, 'special-defense')) : ''}>
                      {details ? getStatValue(details, 'special-defense') : '-'}
                    </span>
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                    <span className={details ? getStatColorClass(getStatValue(details, 'speed')) : ''}>
                      {details ? getStatValue(details, 'speed') : '-'}
                    </span>
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-center font-bold">
                    {details ? getTotalStats(details) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Loading indicator at the bottom */}
        {loadingDetails && (
          <div className="flex justify-center p-4">
            <div className="loader border-4 border-gray-200 border-t-red-500 rounded-full w-6 h-6 animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(PokemonTable);
import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import usePokemonList from './hooks/usePokemonList';
import usePokemonDetails from './hooks/usePokemonDetails';
import SearchBar from './components/SearchBar';
import PokemonList from './components/PokemonList';
import PokemonTable from './components/PokemonTable';
import PokemonModal from './components/PokemonModal';
import ViewToggle from './components/ViewToggle';
import CacheProgressBar from './components/CacheProgressBar';

// Memo-ized components for better performance
const MemoizedSearchBar = memo(SearchBar);
const MemoizedPokemonList = memo(PokemonList);
const MemoizedPokemonTable = memo(PokemonTable);
const MemoizedPokemonModal = memo(PokemonModal);
const MemoizedViewToggle = memo(ViewToggle);

export default function App() {
  // Hydrate detailsCache from localStorage on mount
  const detailsCache = useRef({});
  useEffect(() => {
    const hydrated = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('pokemonDetails_')) {
        try {
          const val = localStorage.getItem(key);
          if (val) {
            const parsed = JSON.parse(val);
            const name = key.replace('pokemonDetails_', '');
            hydrated[name] = parsed;
          }
        } catch (e) {
          // Ignore broken entries
        }
      }
    }
    detailsCache.current = hydrated;
  }, []);

  // Background cache warmer: progressively fetch and cache all missing pokemon details
  // Only call usePokemonList once at the top
  const { pokemonList, filteredList, loadingList, search, setSearch } = usePokemonList();
  // Cache warming state
  const [cacheProgress, setCacheProgress] = useState({
    isActive: false,
    progress: 0,
    total: 0,
    currentTask: '',
  });

  useEffect(() => {
    if (!pokemonList || pokemonList.length === 0) return;
    let cancelled = false;
    // Count how many are already cached
    let cachedCount = 0;
    for (const p of pokemonList) {
      if (detailsCache.current[p.name]) cachedCount++;
      else {
        const storageKey = `pokemonDetails_${p.name}`;
        try {
          const cachedData = localStorage.getItem(storageKey);
          if (cachedData) {
            const data = JSON.parse(cachedData);
            if (data) {
              detailsCache.current[p.name] = data;
              cachedCount++;
            }
          }
        } catch {}
      }
    }
    const total = pokemonList.length;
    const percentCached = cachedCount / total;
    // Optimize initial download: large batch, no delay if <10% cached
    const batchSize = percentCached < 0.1 ? 50 : 10;
    const delay = percentCached < 0.1 ? () => Promise.resolve() : ms => new Promise(res => setTimeout(res, ms));
    setCacheProgress({
      isActive: cachedCount < total,
      progress: cachedCount,
      total,
      currentTask: percentCached < 0.1 ? 'Initial Download (Pokémon Details)' : 'Warming Pokémon Details Cache',
    });
    async function warmCache() {
      // Find uncached
      const uncached = pokemonList.filter(p => !detailsCache.current[p.name]);
      for (let i = 0; i < uncached.length && !cancelled; i += batchSize) {
        const batch = uncached.slice(i, i + batchSize);
        await Promise.all(batch.map(async (pokemon) => {
          try {
            const response = await fetch(pokemon.url);
            if (!response.ok) throw new Error();
            const data = await response.json();
            detailsCache.current[pokemon.name] = data;
            try {
              localStorage.setItem(`pokemonDetails_${pokemon.name}`, JSON.stringify(data));
            } catch {}
            setCacheProgress(prev => ({
              ...prev,
              progress: prev.progress + 1,
            }));
          } catch {}
        }));
        // Wait between batches
        if (i + batchSize < uncached.length) await delay(500);
      }
      setCacheProgress(prev => ({ ...prev, isActive: false }));
    }
    if (cachedCount < total) {
      setCacheProgress(prev => ({ ...prev, isActive: true }));
      warmCache();
    }
    return () => { cancelled = true; };
  }, [pokemonList]);
  const [visibleCount, setVisibleCount] = useState(30);
  const [loadingTableDetails, setLoadingTableDetails] = useState(false);

  // Fetch Pokemon details in batches (hoisted from PokemonTable)
  const fetchPokemonDetails = useCallback(async (pokemonList) => {
    if (!pokemonList || pokemonList.length === 0) return;
    setLoadingTableDetails(true);
    // Prepare batch of Pokemon to fetch
    const pokemonToFetch = pokemonList.filter(p => !detailsCache.current[p.name]);
    if (pokemonToFetch.length === 0) {
      setLoadingTableDetails(false);
      return;
    }
    const batchSize = 10;
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    for (let i = 0; i < pokemonToFetch.length; i += batchSize) {
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
          const response = await fetch(pokemon.url);
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
          console.error(`Error fetching details for ${pokemon.name}:`, error);
        }
      }));
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < pokemonToFetch.length) {
        await delay(300);
      }
    }
    setLoadingTableDetails(false);
  }, []);

  const { details, loadingDetails, selectPokemon, clearSelection } = usePokemonDetails();
  const [activeTab, setActiveTab] = useState('stats');
  const [clearingCache, setClearingCache] = useState(false);
  const [currentView, setCurrentView] = useState('grid'); // 'grid' or 'table'
  const clearTimeoutRef = useRef(null);

  // Enhanced cache clearing handler with feedback
  const handleClearCache = useCallback(() => {
    setClearingCache(true);
    
    // Clear any existing timeout
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
    }
    
    // Function to count and remove cached items
    const clearCacheItems = () => {
      let count = 0;
      
      // Helper to safely remove items
      const safeRemove = (key) => {
        try {
          localStorage.removeItem(key);
          count++;
        } catch (e) {
          console.error(`Error removing ${key}:`, e);
        }
      };
      
      // Process in batches to avoid blocking UI
      const processNextBatch = (keys, index, batchSize = 50) => {
        const end = Math.min(index + batchSize, keys.length);
        
        for (let i = index; i < end; i++) {
          safeRemove(keys[i]);
        }
        
        if (end < keys.length) {
          // Schedule next batch
          clearTimeoutRef.current = setTimeout(() => {
            processNextBatch(keys, end, batchSize);
          }, 0);
        } else {
          // All done
          console.log(`Cleared ${count} cached items`);
          setClearingCache(false);
          
          // Reload page to reset in-memory caches
          window.location.reload();
        }
      };
      
      // Get all localStorage keys
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key.startsWith('pokemonList') || 
          key.startsWith('pokemonDetails_') || 
          key.startsWith('move_') ||
          key.startsWith('pokemonMoves_')
        ) {
          keys.push(key);
        }
      }
      
      // Start processing
      if (keys.length > 0) {
        processNextBatch(keys, 0);
      } else {
        console.log('No cache items to clear');
        setClearingCache(false);
        window.location.reload();
      }
    };
    
    // Start the cache clearing process
    clearCacheItems();
  }, []);
  
  // Memoized handlers
  const handleSearchChange = useCallback((value) => {
    setSearch(value);
  }, [setSearch]);
  
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleViewChange = useCallback((view) => {
    setCurrentView(view);
  }, []);

  // Only show spinner if nothing loaded yet
  if (loadingList && (!filteredList || filteredList.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <CacheProgressBar
          isActive={cacheProgress.isActive}
          progress={cacheProgress.progress}
          total={cacheProgress.total}
          currentTask={cacheProgress.currentTask}
        />
        <div className="flex flex-col items-center mt-16">
          <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl text-blue-700">Loading Pokémon List...</p>
        </div>
      </div>
    );
  }

  // Error state: no Pokémon loaded after fetch
  if (!pokemonList || pokemonList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <CacheProgressBar
          isActive={cacheProgress.isActive}
          progress={cacheProgress.progress}
          total={cacheProgress.total}
          currentTask={cacheProgress.currentTask}
        />
        <div className="flex flex-col items-center mt-16">
          <svg className="h-12 w-12 text-red-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl text-red-700">Failed to load Pokémon list. Check your connection and refresh.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <CacheProgressBar
        isActive={cacheProgress.isActive}
        progress={cacheProgress.progress}
        total={cacheProgress.total}
        currentTask={cacheProgress.currentTask}
      />
      <button
        onClick={handleClearCache}
        disabled={clearingCache}
        className={`absolute top-4 right-4 font-semibold px-4 py-2 rounded shadow focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 z-10 ${
          clearingCache 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title="Clear cached Pokémon and move data"
      >
        {clearingCache ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Clearing...
          </span>
        ) : (
          'Clear Cache'
        )}
      </button>
      
      <h1 className="text-4xl font-bold text-center mb-2 text-red-600">Pokédex</h1>
      <p className="text-center text-gray-600 mb-4">Search for any Pokémon to view detailed information</p>

      <MemoizedSearchBar search={search} onSearchChange={handleSearchChange} />

      {/* View Toggle */}
      <MemoizedViewToggle currentView={currentView} onViewChange={handleViewChange} />

      {loadingList ? (
        <div className="flex justify-center mt-8">
          <div className="border-4 border-gray-200 border-t-red-500 rounded-full w-12 h-12 animate-spin" />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">No Pokémon found matching your search.</p>
        </div>
      ) : (
        <>
          {currentView === 'grid' ? (
            <MemoizedPokemonList 
              list={filteredList} 
              loading={loadingList} 
              onSelect={selectPokemon} 
            />
          ) : (
            <MemoizedPokemonTable 
              list={filteredList} 
              loading={loadingList} 
              onSelect={selectPokemon} 
              visibleCount={visibleCount}
              setVisibleCount={setVisibleCount}
              detailsCache={detailsCache}
              fetchPokemonDetails={fetchPokemonDetails}
              loadingTableDetails={loadingTableDetails}
            />
          )}
        </>
      )}

      {details && (
        <MemoizedPokemonModal
          details={details}
          loading={loadingDetails}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onClose={clearSelection}
        />
      )}
    </div>
  );
}
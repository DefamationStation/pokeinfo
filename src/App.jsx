import React, { useState, useCallback, memo } from 'react';
import usePokemonList from './hooks/usePokemonList';
import usePokemonDetails from './hooks/usePokemonDetails';
import SearchBar from './components/SearchBar';
import PokemonList from './components/PokemonList';
import PokemonModal from './components/PokemonModal';

// Memo-ized components for better performance
const MemoizedSearchBar = memo(SearchBar);
const MemoizedPokemonList = memo(PokemonList);
const MemoizedPokemonModal = memo(PokemonModal);

export default function App() {
  // Cache clearing handler
  const handleClearCache = useCallback(() => {
    // Remove main pokemon list
    localStorage.removeItem('pokemonList');
    // Remove all pokemon details
    Object.keys(localStorage)
      .filter(key => key.startsWith('pokemonDetails_'))
      .forEach(key => localStorage.removeItem(key));
    // Remove all move details
    Object.keys(localStorage)
      .filter(key => key.startsWith('move_'))
      .forEach(key => localStorage.removeItem(key));
    // Reload page to clear in-memory cache
    window.location.reload();
  }, []);
  
  const { filteredList, loadingList, search, setSearch } = usePokemonList();
  const { details, loadingDetails, selectPokemon, clearSelection } = usePokemonDetails();
  const [activeTab, setActiveTab] = useState('stats');
  
  // Memoized handlers
  const handleSearchChange = useCallback((value) => {
    setSearch(value);
  }, [setSearch]);
  
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 relative">
      {/* Clear Cache Button */}
      <button
        onClick={handleClearCache}
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded shadow focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 z-10"
        title="Clear cached Pokémon and move data"
      >
        Clear Cache
      </button>
      <h1 className="text-4xl font-bold text-center mb-2 text-red-600">Pokédex</h1>
      <p className="text-center text-gray-600 mb-6">Search for any Pokémon to view detailed information</p>

      <MemoizedSearchBar search={search} onSearchChange={handleSearchChange} />

      {loadingList ? (
        <div className="flex justify-center mt-8">
          <div className="border-4 border-gray-200 border-t-red-500 rounded-full w-12 h-12 animate-spin" />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">No Pokémon found matching your search.</p>
        </div>
      ) : (
        <MemoizedPokemonList 
          list={filteredList} 
          loading={loadingList} 
          onSelect={selectPokemon} 
        />
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
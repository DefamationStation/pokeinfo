import React, { useState } from 'react';
import usePokemonList from './hooks/usePokemonList';
import usePokemonDetails from './hooks/usePokemonDetails';
import SearchBar from './components/SearchBar';
import PokemonList from './components/PokemonList';
import PokemonModal from './components/PokemonModal';

export default function App() {
  const { filteredList, loadingList, search, setSearch } = usePokemonList();
  const { details, loadingDetails, selectPokemon, clearSelection } = usePokemonDetails();
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-2 text-red-600">Pokédex</h1>
      <p className="text-center text-gray-600 mb-6">Search for any Pokémon to view detailed information</p>

      <SearchBar search={search} onSearchChange={setSearch} />

      {loadingList ? (
        <div className="flex justify-center mt-8">
          <div className="border-4 border-gray-200 border-t-red-500 rounded-full w-12 h-12 animate-spin" />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">No Pokémon found matching your search.</p>
        </div>
      ) : (
        <PokemonList list={filteredList} loading={loadingList} onSelect={selectPokemon} />
      )}

      {details && (
        <PokemonModal
          details={details}
          loading={loadingDetails}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={clearSelection}
        />
      )}
    </div>
  );
}
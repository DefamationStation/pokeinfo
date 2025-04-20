import React from 'react';
import PokemonCard from './PokemonCard';

export default function PokemonList({ list, loading, onSelect }) {
  if (loading) return <p>Loading Pokémon…</p>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
      {list.map(p => (
        <PokemonCard key={p.name} pokemon={p} onSelect={onSelect} />
      ))}
    </div>
  );
}

import React, { memo } from 'react';

export default memo(function PokemonCard({ pokemon, onSelect }) {
  const id = pokemon.url.split('/').filter(Boolean).pop();
  const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  return (
    <div
      className="cursor-pointer p-2 bg-white rounded shadow hover:shadow-lg text-center"
      onClick={() => onSelect(pokemon)}
    >
      <img src={sprite} alt={pokemon.name} className="mx-auto mb-2" />
      <h3 className="capitalize">{pokemon.name}</h3>
    </div>
  );
});

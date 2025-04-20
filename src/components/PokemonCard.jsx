import React, { memo, useState, useEffect, useCallback } from 'react';

export default memo(function PokemonCard({ pokemon, onSelect }) {
  const artwork = pokemon.artwork;
  const [imgSrc, setImgSrc] = useState(artwork);
  const placeholder = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; // Pokéball icon
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    setImgSrc(artwork);
  }, [artwork]);

  // Debounced click handler to prevent multiple rapid clicks
  const handleClick = useCallback((e) => {
    e.stopPropagation(); // Prevent event bubbling
    
    // Prevent double clicks
    if (isClicking) return;
    
    setIsClicking(true);
    onSelect(pokemon);
    
    // Reset clicking state after a short delay
    setTimeout(() => {
      setIsClicking(false);
    }, 300);
  }, [isClicking, onSelect, pokemon]);

  return (
    <div
      className="cursor-pointer p-2 bg-white rounded shadow hover:shadow-lg text-center"
      onClick={handleClick}
    >
      <img
        src={imgSrc || placeholder}
        alt={pokemon.name || 'Pokémon'}
        className="mx-auto mb-2"
        onError={() => {
          // If both default sprite and artwork fail, show Pokéball placeholder
          if (imgSrc !== placeholder) {
            setImgSrc(placeholder);
          }
        }}
      />
      <h3 className="capitalize">{pokemon.name}</h3>
    </div>
  );
});
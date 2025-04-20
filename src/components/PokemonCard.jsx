import React, { memo, useState, useEffect, useCallback } from 'react';

export default memo(function PokemonCard({ pokemon, onSelect }) {
  const id = pokemon.url.split('/').filter(Boolean).pop();
  const defaultSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  const artwork = pokemon.artwork;
  const [imgSrc, setImgSrc] = useState(artwork || defaultSprite);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    // Reset image source if pokemon changes
    setImgSrc(artwork || defaultSprite);
  }, [artwork, defaultSprite]);

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
        src={imgSrc}
        alt={pokemon.name}
        className="mx-auto mb-2"
        onError={() => {
          // If the default sprite fails, try artwork if not already set
          if (imgSrc !== artwork && artwork) {
            setImgSrc(artwork);
          }
        }}
      />
      <h3 className="capitalize">{pokemon.name}</h3>
    </div>
  );
});
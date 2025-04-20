import React, { memo, useState, useCallback } from 'react';
import typeColors from '../constants/typeColors';

export default memo(function PokemonCard({ pokemon, onSelect }) {
  // Default placeholder
  const placeholder = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
  
  // Extract pokemon ID for fallback sprite if needed
  const getPokemonId = (url) => {
    try {
      return parseInt(url.split('/').filter(Boolean).pop());
    } catch (e) {
      return null;
    }
  };
  
  // Determine the best image source to use with fallbacks
  const getBestImageSource = () => {
    // Try official artwork first (highest quality)
    if (pokemon.artwork) {
      return pokemon.artwork;
    }
    
    // Try regular sprite next
    if (pokemon.sprite) {
      return pokemon.sprite;
    }
    
    // If we have a URL, we can try to generate the sprite URL from the pokemon ID
    if (pokemon.url) {
      const id = getPokemonId(pokemon.url);
      if (id) {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
      }
    }
    
    // Last resort fallback
    return placeholder;
  };
  
  const [isClicking, setIsClicking] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  // Get the initial image source
  const initialSource = getBestImageSource();
  
  // Handle image error - only fall back to placeholder
  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
    }
  };

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
        src={imgError ? placeholder : initialSource}
        alt={pokemon.name || 'Pokémon'}
        className="mx-auto mb-2 h-24 w-24 object-contain"
        onError={handleImageError}
      />
      <h3 className="capitalize text-sm mt-2">{pokemon.name}</h3>
      
      {/* Display pokemon types if available */}
      {pokemon.types && pokemon.types.length > 0 && (
        <div className="mt-1 flex justify-center gap-1">
          {pokemon.types.map(typeObj => (
            <span 
              key={typeObj.type.name}
              className={`px-1 py-0.5 text-xs rounded-full ${typeColors[typeObj.type.name] || typeColors.normal}`}
            >
              {typeObj.type.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});
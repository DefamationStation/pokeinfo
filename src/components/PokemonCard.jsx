import React, { memo } from 'react';

export default memo(function PokemonCard({ pokemon, onSelect }) {
  const id = pokemon.url.split('/').filter(Boolean).pop();
  const defaultSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  const artwork = pokemon.artwork;
  const [imgSrc, setImgSrc] = React.useState(artwork || defaultSprite);

  React.useEffect(() => {
    // Reset image source if pokemon changes
    setImgSrc(artwork || defaultSprite);
  }, [artwork, defaultSprite]);

  return (
    <div
      className="cursor-pointer p-2 bg-white rounded shadow hover:shadow-lg text-center"
      onClick={() => onSelect(pokemon)}
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

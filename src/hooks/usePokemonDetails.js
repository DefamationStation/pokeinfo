import { useState, useRef } from 'react';

export default function usePokemonDetails() {
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const detailsCache = useRef({});

  const selectPokemon = (pokemon) => {
    setLoadingDetails(true);
    const name = pokemon.name;
    const storageKey = 'pokemonDetails_' + name;
    const cachedStorage = localStorage.getItem(storageKey);

    if (detailsCache.current[name]) {
      setDetails(detailsCache.current[name]);
      setLoadingDetails(false);
    } else if (cachedStorage) {
      const data = JSON.parse(cachedStorage);
      detailsCache.current[name] = data;
      setDetails(data);
      setLoadingDetails(false);
    } else {
      fetch(pokemon.url)
        .then(res => res.json())
        .then(data => {
          detailsCache.current[name] = data;
          localStorage.setItem(storageKey, JSON.stringify(data));
          new Image().src = data.sprites.other['official-artwork'].front_default;
          setDetails(data);
          setLoadingDetails(false);
        });
    }
  };

  const clearSelection = () => {
    setDetails(null);
  };

  return { details, loadingDetails, selectPokemon, clearSelection };
}

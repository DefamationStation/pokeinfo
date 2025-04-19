import { useState, useEffect } from 'react';

export default function usePokemonList() {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('pokemonList');
    if (stored) {
      const parsed = JSON.parse(stored);
      setPokemonList(parsed);
      setFilteredList(parsed);
      setLoadingList(false);
    } else {
      fetch('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0')
        .then(res => res.json())
        .then(data => {
          const cleaned = data.results.filter(p => {
            const name = p.name.toLowerCase();
            return !name.startsWith('miraidon-') && !name.startsWith('koraidon-');
          });
          setPokemonList(cleaned);
          setFilteredList(cleaned);
          localStorage.setItem('pokemonList', JSON.stringify(cleaned));
          setLoadingList(false);
        });
    }
  }, []);

  useEffect(() => {
    const filtered = pokemonList.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredList(filtered);
  }, [search, pokemonList]);

  return { pokemonList, filteredList, loadingList, search, setSearch };
}

import React, { useState, useEffect } from 'react';

// Progressive details fetcher: fetch details for each Pokémon and update state as each arrives
const hydratePokemonDetails = async (list, setPokemonList, setFilteredList) => {
  const updatedList = [...list];
  const delay = ms => new Promise(res => setTimeout(res, ms));

  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    try {
      const res = await fetch(p.url);
      if (!res.ok) throw new Error();
      const details = await res.json();
      let types = [];
      let artwork = null;
      if (details && details.types && Array.isArray(details.types)) {
        types = details.types;
        artwork = details.sprites?.other?.['official-artwork']?.front_default || null;
      }
      updatedList[i] = { ...p, types, artwork };
      setPokemonList(updatedList.slice());
      setFilteredList(updatedList.slice());
      localStorage.setItem('pokemonList', JSON.stringify(updatedList));
    } catch {}
    // Optional: add a small delay to avoid rate limits
    if (i % 10 === 9) await delay(300);
  }
};

// Note: Each Pokémon object may now have an 'artwork' property (string | null)
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
      setLoadingList(false); // Always allow UI to render, even if details are missing
      if (!parsed[0]?.types) {
        hydratePokemonDetails(parsed, setPokemonList, setFilteredList);
      }
    } else {
      // Fetch all Pokémon in batches using API pagination
      const fetchAllPokemon = async () => {
        let nextUrl = 'https://pokeapi.co/api/v2/pokemon?limit=200&offset=0';
        let allResults = [];
        while (nextUrl) {
          const res = await fetch(nextUrl);
          const data = await res.json();
          allResults = allResults.concat(data.results);
          nextUrl = data.next;
        }
        // Remove unwanted forms if needed
        const cleaned = allResults.filter(p => {
          const name = p.name.toLowerCase();
          return !name.startsWith('miraidon-') && !name.startsWith('koraidon-');
        });
        setPokemonList(cleaned);
        setFilteredList(cleaned);
        setLoadingList(false); // UI can render now
        // Fetch types and artwork for all (background)
        hydratePokemonDetails(cleaned, setPokemonList, setFilteredList);
      };
      fetchAllPokemon();
    }
  }, []);

  // Prevent flicker: only update filteredList when search changes
  const originalListRef = React.useRef([]);
  // Set the original list only once, when first loaded
  useEffect(() => {
    if (pokemonList.length > 0 && originalListRef.current.length === 0) {
      originalListRef.current = pokemonList;
    }
  }, [pokemonList]);

  useEffect(() => {
    // Split search into words, treat each as a type if it matches a known type
    const searchTerms = search.toLowerCase().split(/\s+/).filter(Boolean);
    const typeList = [
      'normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'
    ];
    const typeTerms = searchTerms.filter(term => typeList.includes(term));
    const nameTerms = searchTerms.filter(term => !typeList.includes(term));

    const filtered = originalListRef.current.filter(p => {
      // Name search: all terms must appear in the name
      const nameMatch = nameTerms.length === 0 || nameTerms.every(term => p.name.toLowerCase().includes(term));
      // Type search: all typeTerms must be present in the Pokémon's types
      let typeMatch = true;
      if (typeTerms.length > 0) {
        // Defensive: if no types data, skip
        if (!p.types || !Array.isArray(p.types)) return false;
        const pokeTypes = p.types.map(t => t.type.name.toLowerCase());
        typeMatch = typeTerms.every(term => pokeTypes.includes(term));
      }
      return nameMatch && typeMatch;
    });
    setFilteredList(filtered);
  }, [search]);

  return { pokemonList, filteredList, loadingList, search, setSearch };
}

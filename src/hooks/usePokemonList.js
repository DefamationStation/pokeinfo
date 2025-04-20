import { useState, useEffect } from 'react';

// Helper to fetch and attach types to all Pokémon in the list
const fetchAndAttachTypes = async (list, setPokemonList, setFilteredList, setLoadingList, batchSize = 10, maxRetries = 2) => {
  setLoadingList(true);
  const updatedList = [...list];
  let i = 0;
  const delay = ms => new Promise(res => setTimeout(res, ms));

  // Helper to fetch details with retries
  const fetchDetailsWithRetry = async (url, retries = maxRetries) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (e) {
        if (attempt === retries) return null;
        await delay(400); // Wait before retry
      }
    }
    return null;
  };

  while (i < list.length) {
    const batch = list.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(async (p) => {
      const details = await fetchDetailsWithRetry(p.url);
      let types = [];
      let artwork = null;
      if (details && details.types && Array.isArray(details.types)) {
        types = details.types;
        artwork = details.sprites?.other?.['official-artwork']?.front_default || null;
      }
      return { ...p, types, artwork };
    }));
    for (let j = 0; j < results.length; j++) {
      updatedList[i + j] = results[j];
    }
    i += batchSize;
    await delay(500); // Wait between batches to avoid rate limits
  }
  setPokemonList(updatedList);
  setFilteredList(updatedList);
  localStorage.setItem('pokemonList', JSON.stringify(updatedList));
  setLoadingList(false);
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
      // If types are missing, fetch them
      if (!parsed[0]?.types) {
        fetchAndAttachTypes(parsed, setPokemonList, setFilteredList, setLoadingList);
      } else {
        setLoadingList(false);
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
        // Fetch types and artwork for all
        fetchAndAttachTypes(cleaned, setPokemonList, setFilteredList, setLoadingList);
      };
      fetchAllPokemon();
    }
  }, []);

  useEffect(() => {
    // Split search into words, treat each as a type if it matches a known type
    const searchTerms = search.toLowerCase().split(/\s+/).filter(Boolean);
    const typeList = [
      'normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'
    ];
    const typeTerms = searchTerms.filter(term => typeList.includes(term));
    const nameTerms = searchTerms.filter(term => !typeList.includes(term));

    const filtered = pokemonList.filter(p => {
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
  }, [search, pokemonList]);

  return { pokemonList, filteredList, loadingList, search, setSearch };
}

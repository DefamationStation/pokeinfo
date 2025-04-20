import React, { useState, useEffect, useCallback } from 'react';

// Progressive details fetcher: fetch details for each Pokémon and update state as each arrives
const hydratePokemonDetails = async (list, setPokemonList, setFilteredList, currentSearch) => {
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
      let sprite = null;
      if (details && details.types && Array.isArray(details.types)) {
        types = details.types;
        artwork = details.sprites?.other?.['official-artwork']?.front_default || null;
        sprite = details.sprites?.front_default || null;
      }
      updatedList[i] = { ...p, types, artwork, sprite };
      setPokemonList(updatedList.slice());
      localStorage.setItem('pokemonList', JSON.stringify(updatedList));
    } catch {}
    // Optional: add a small delay to avoid rate limits
    if (i % 10 === 9) await delay(300);
  }
};

// Separate the filter logic into a pure function for reuse
const filterPokemonList = (list, searchString) => {
  if (!searchString) return list;
  
  const typeList = [
    'normal','fire','water','electric','grass','ice','fighting','poison',
    'ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'
  ];
  
  const searchTerms = searchString.toLowerCase().split(/\s+/).filter(Boolean);
  const typeTerms = searchTerms.filter(term => typeList.includes(term));
  const nameTerms = searchTerms.filter(term => !typeList.includes(term));
  
  return list.filter(p => {
    // Name search: all terms must appear in the name
    const nameMatch = nameTerms.length === 0 || 
                      nameTerms.every(term => p.name.toLowerCase().includes(term));
    
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
};

export default function usePokemonList() {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState('');

  // Load initial Pokemon list
  useEffect(() => {
    const stored = localStorage.getItem('pokemonList');
    if (stored) {
      const parsed = JSON.parse(stored);
      setPokemonList(parsed);
      setFilteredList(parsed); // Start with all Pokemon visible
      setLoadingList(false);
      
      // If we don't have full data, fetch it in the background
      if (!parsed[0]?.types) {
        hydratePokemonDetails(parsed, setPokemonList, setFilteredList, search);
      }
    } else {
      // Fetch all Pokémon
      const fetchAllPokemon = async () => {
        let nextUrl = 'https://pokeapi.co/api/v2/pokemon?limit=200&offset=0';
        let allResults = [];
        
        try {
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
          hydratePokemonDetails(cleaned, setPokemonList, setFilteredList, search);
          
        } catch (error) {
          console.error("Error fetching Pokemon:", error);
          setLoadingList(false);
        }
      };
      
      fetchAllPokemon();
    }
  }, []);

  // Handle search filtering with a separate effect
  useEffect(() => {
    if (!pokemonList.length) return;
    
    // Filter the list based on the current search term
    const filtered = filterPokemonList(pokemonList, search);
    setFilteredList(filtered);
    
  }, [search, pokemonList]);

  // Create a memoized search setter to avoid unnecessary re-renders
  const handleSearchChange = useCallback((newSearch) => {
    setSearch(newSearch);
  }, []);

  return { 
    pokemonList, 
    filteredList, 
    loadingList, 
    search, 
    setSearch: handleSearchChange
  };
}
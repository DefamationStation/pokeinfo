import React, { useState, useEffect, useRef, memo } from 'react';

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredList, setFilteredList] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');

  const audioRef = useRef(null);
  const typeColors = {
    normal: 'bg-gray-400 text-white',
    fire: 'bg-red-600 text-white',
    water: 'bg-blue-500 text-white',
    electric: 'bg-yellow-500 text-white',
    grass: 'bg-green-500 text-white',
    ice: 'bg-blue-300 text-white',
    fighting: 'bg-orange-600 text-white',
    poison: 'bg-purple-600 text-white',
    ground: 'bg-yellow-600 text-white',
    flying: 'bg-indigo-400 text-white',
    psychic: 'bg-pink-500 text-white',
    bug: 'bg-green-600 text-white',
    rock: 'bg-yellow-700 text-white',
    ghost: 'bg-indigo-700 text-white',
    dragon: 'bg-purple-700 text-white',
    dark: 'bg-gray-800 text-white',
    steel: 'bg-gray-500 text-white',
    fairy: 'bg-pink-400 text-white',
  };

  useEffect(() => {
    const storedList = localStorage.getItem('pokemonList');
    if (storedList) {
      const parsed = JSON.parse(storedList);
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

  const detailsCache = useRef({});
  const moveCache = useRef({});
  const onSelect = (pokemon) => {
    setSelectedPokemon(pokemon);
    setActiveTab('stats'); // Reset to stats tab when opening a new Pokemon
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
      setLoadingDetails(true);
      fetch(pokemon.url)
        .then(res => res.json())
        .then(data => {
          detailsCache.current[name] = data;
          localStorage.setItem(storageKey, JSON.stringify(data));
          // Preload official artwork to cache
          new Image().src = data.sprites.other['official-artwork'].front_default;
          setDetails(data);
          setLoadingDetails(false);
        });
    }
  };

  const closeModal = () => {
    setSelectedPokemon(null);
    setDetails(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedPokemon) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedPokemon]);

  const PokemonCard = memo(({ pokemon }) => {
    const id = pokemon.url.split('/').filter(Boolean).pop();
    const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    return (
      <div 
        onClick={() => onSelect(pokemon)} 
        className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition flex flex-col items-center"
      >
        <div className="bg-gray-100 rounded-full p-2 mb-2 w-24 h-24 flex items-center justify-center">
          <img src={sprite} alt={pokemon.name} className="w-20 h-20" />
        </div>
        <p className="text-center capitalize font-medium text-gray-800">
          {pokemon.name}
        </p>
        <span className="text-xs text-gray-500">#{id}</span>
      </div>
    );
  });

  // Format stat name for display
  const formatStatName = (stat) => {
    return stat.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Calculate stat color based on value
  const getStatColor = (value) => {
    if (value < 50) return 'bg-red-500';
    if (value < 80) return 'bg-yellow-500';
    if (value < 120) return 'bg-green-500';
    return 'bg-blue-500';
  };

  // MoveItem component fetches and caches move power
  const MoveItem = memo(({ moveInfo }) => {
    const [power, setPower] = useState(null);
    const moveName = moveInfo.move.name;
    const moveKey = 'move_' + moveName;
    useEffect(() => {
      if (moveCache.current[moveName] != null) {
        setPower(moveCache.current[moveName]);
      } else {
        const stored = localStorage.getItem(moveKey);
        if (stored) {
          const data = JSON.parse(stored);
          moveCache.current[moveName] = data.power;
          setPower(data.power);
        } else {
          fetch(moveInfo.move.url)
            .then(res => res.json())
            .then(data => {
              moveCache.current[moveName] = data.power;
              try { localStorage.setItem(moveKey, JSON.stringify({ power: data.power })); } catch {}
              setPower(data.power);
            });
        }
      }
    }, [moveName, moveInfo.move.url]);
    const latestVersion = moveInfo.version_group_details[moveInfo.version_group_details.length - 1];
    const formattedName = moveName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return (
      <div key={moveName} className="bg-gray-100 p-3 rounded">
        <div className="flex justify-between">
          <span className="font-medium">{formattedName}</span>
          <div className="flex space-x-2">
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Level {latestVersion.level_learned_at}</span>
            <span className="text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded">Power {power !== null ? power : '—'}</span>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-2 text-red-600">Pokédex</h1>
      <p className="text-center text-gray-600 mb-6">Search for any Pokémon to view detailed information</p>
      
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search Pokémon by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <svg 
          className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      </div>

      {loadingList ? (
        <div className="flex justify-center mt-8">
          <div className="border-4 border-gray-200 border-t-red-500 rounded-full w-12 h-12 animate-spin" />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">No Pokémon found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredList.map(pokemon => (
            <PokemonCard key={pokemon.name} pokemon={pokemon} />
          ))}
        </div>
      )}

      {selectedPokemon && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeModal}>
          <div 
            className="bg-white rounded-xl shadow-2xl w-11/12 md:w-4/5 lg:w-2/3 max-w-4xl max-h-[90vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            {loadingDetails || !details ? (
              <div className="flex justify-center p-12">
                <div className="border-4 border-gray-200 border-t-red-500 rounded-full w-16 h-16 animate-spin" />
              </div>
            ) : (
              <div>
                {/* Header */}
                <div className="bg-red-600 p-4 text-white flex justify-between items-center relative">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold capitalize">{details.name}</h1>
                    <span className="bg-white text-gray-800 text-sm font-medium px-2 py-1 rounded">#{details.id}</span>
                  </div>
                  <div className="flex space-x-2">
                    {details.types.map(typeInfo => (
                      <span 
                        key={typeInfo.type.name} 
                        className={`px-3 py-1 rounded text-white text-sm font-medium ${typeColors[typeInfo.type.name] || 'bg-gray-400'}`}
                      >
                        {typeInfo.type.name.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-white hover:text-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Content */}
                <div className="flex flex-col md:flex-row">
                  {/* Left column - Sprite */}
                  <div className="md:w-1/3 p-6 bg-gray-100 flex justify-center items-center">
                    <div className="relative">
                      <img 
                        src={details.sprites.other["official-artwork"].front_default} 
                        alt={details.name}
                        className="w-64 h-64 object-contain"
                      />
                      <button
                        onClick={() => audioRef.current.play()}
                        className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full mx-auto block transition"
                      >
                        Play Cry
                      </button>
                      <audio ref={audioRef} src={details.cries?.latest} />
                    </div>
                  </div>
                  
                  {/* Right column - Info */}
                  <div className="md:w-2/3 p-6">
                    {/* Tab buttons */}
                    <div className="flex border-b mb-6">
                      <button 
                        onClick={() => setActiveTab('stats')} 
                        className={`px-4 py-2 ${activeTab === 'stats' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500'}`}
                      >
                        Base Stats
                      </button>
                      <button 
                        onClick={() => setActiveTab('abilities')} 
                        className={`px-4 py-2 ${activeTab === 'abilities' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500'}`}
                      >
                        Abilities
                      </button>
                      <button 
                        onClick={() => setActiveTab('details')} 
                        className={`px-4 py-2 ${activeTab === 'details' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500'}`}
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => setActiveTab('moves')} 
                        className={`px-4 py-2 ${activeTab === 'moves' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500'}`}
                      >
                        Moves
                      </button>
                    </div>
                    
                    {/* Stats Tab */}
                    {activeTab === 'stats' && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Base Stats</h2>
                        <div className="space-y-4">
                          {details.stats.map(statInfo => {
                            const statName = formatStatName(statInfo.stat.name);
                            const percentage = (statInfo.base_stat / 255) * 100;
                            const statColor = getStatColor(statInfo.base_stat);
                            
                            return (
                              <div key={statInfo.stat.name}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium">{statName}</span>
                                  <span className="text-sm font-medium">{statInfo.base_stat}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className={`${statColor} h-2.5 rounded-full`} 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                          
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                              <span className="font-bold">Total</span>
                              <span className="font-bold">
                                {details.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Abilities Tab */}
                    {activeTab === 'abilities' && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Abilities</h2>
                        <div className="space-y-4">
                          {details.abilities.map(abilityInfo => {
                            const formattedName = abilityInfo.ability.name
                              .split('-')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ');
                            
                            return (
                              <div key={abilityInfo.ability.name} className="bg-gray-100 p-4 rounded">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium">{formattedName}</h3>
                                  {abilityInfo.is_hidden && (
                                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                      Hidden Ability
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Details Tab */}
                    {activeTab === 'details' && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Pokémon Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-100 p-4 rounded">
                            <h3 className="text-sm text-gray-500">Height</h3>
                            <p>{(details.height / 10).toFixed(1)} m</p>
                          </div>
                          <div className="bg-gray-100 p-4 rounded">
                            <h3 className="text-sm text-gray-500">Weight</h3>
                            <p>{(details.weight / 10).toFixed(1)} kg</p>
                          </div>
                          <div className="bg-gray-100 p-4 rounded">
                            <h3 className="text-sm text-gray-500">Base Experience</h3>
                            <p>{details.base_experience}</p>
                          </div>
                          <div className="bg-gray-100 p-4 rounded">
                            <h3 className="text-sm text-gray-500">Order</h3>
                            <p>{details.order}</p>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold mt-6 mb-3">Held Items</h3>
                        {details.held_items && details.held_items.length > 0 ? (
                          <div className="space-y-2">
                            {details.held_items.map(heldItemInfo => {
                              const formattedName = heldItemInfo.item.name
                                .split('-')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                              
                              return (
                                <div key={heldItemInfo.item.name} className="bg-gray-100 p-3 rounded flex justify-between">
                                  <span>{formattedName}</span>
                                  <span className="text-sm text-gray-600">
                                    {heldItemInfo.version_details[0]?.rarity}% chance
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-500">No held items</p>
                        )}
                      </div>
                    )}
                    
                    {/* Moves Tab */}
                    {activeTab === 'moves' && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Moves</h2>
                        {details.moves && details.moves.length > 0 ? (
                          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {details.moves.slice().sort((a, b) => {
                              const aLvl = a.version_group_details[a.version_group_details.length - 1].level_learned_at;
                              const bLvl = b.version_group_details[b.version_group_details.length - 1].level_learned_at;
                              return aLvl - bLvl;
                            }).map(moveInfo => (
                              <MoveItem key={moveInfo.move.name} moveInfo={moveInfo} />
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No moves available</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
import React, { useState, useEffect, useRef, memo } from 'react';

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredList, setFilteredList] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const audioRef = useRef(null);
  const typeColors = {
    normal: 'bg-gray-200 text-gray-800',
    fire: 'bg-red-200 text-red-800',
    water: 'bg-blue-200 text-blue-800',
    electric: 'bg-yellow-200 text-yellow-800',
    grass: 'bg-green-200 text-green-800',
    ice: 'bg-blue-100 text-blue-800',
    fighting: 'bg-orange-200 text-orange-800',
    poison: 'bg-purple-200 text-purple-800',
    ground: 'bg-yellow-300 text-yellow-900',
    flying: 'bg-indigo-200 text-indigo-800',
    psychic: 'bg-pink-200 text-pink-800',
    bug: 'bg-green-100 text-green-800',
    rock: 'bg-yellow-900 text-yellow-100',
    ghost: 'bg-indigo-900 text-white',
    dragon: 'bg-purple-800 text-white',
    dark: 'bg-gray-800 text-white',
    steel: 'bg-gray-300 text-gray-900',
    fairy: 'bg-pink-100 text-pink-800',
  };
  const statColors = {
    hp: 'bg-red-500',
    attack: 'bg-orange-500',
    defense: 'bg-yellow-500',
    'special-attack': 'bg-pink-500',
    'special-defense': 'bg-blue-500',
    speed: 'bg-green-500',
  };

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0')
      .then(res => res.json())
      .then(data => {
        const cleaned = data.results.filter(p => {
          const name = p.name.toLowerCase();
          return !name.startsWith('miraidon-') && !name.startsWith('koraidon-');
        });
        setPokemonList(cleaned);
        setFilteredList(cleaned);
        setLoadingList(false);
      });
  }, []);

  useEffect(() => {
    const filtered = pokemonList.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredList(filtered);
  }, [search, pokemonList]);

  const detailsCache = useRef({});
  const onSelect = (pokemon) => {
    setSelectedPokemon(pokemon);
    const name = pokemon.name;
    if (detailsCache.current[name]) {
      setDetails(detailsCache.current[name]);
      setLoadingDetails(false);
    } else {
      setLoadingDetails(true);
      fetch(pokemon.url)
        .then(res => res.json())
        .then(data => {
          detailsCache.current[name] = data;
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

  const PokemonCard = memo(({ pokemon }) => {
    const id = pokemon.url.split('/').filter(Boolean).pop();
    const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    return (
      <div onClick={() => onSelect(pokemon)} className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition">
        <img src={sprite} alt={pokemon.name} className="w-20 h-20 mx-auto mb-2" />
        <p className="text-center capitalize font-medium">{pokemon.name}</p>
      </div>
    );
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-4">Pokedex</h1>
      <input
        type="text"
        placeholder="Search Pokemon"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loadingList ? (
        <div className="flex justify-center mt-8">
          <div className="border-4 border-gray-200 border-t-blue-500 rounded-full w-12 h-12 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredList.map(pokemon => (
            <PokemonCard key={pokemon.name} pokemon={pokemon} />
          ))}
        </div>
      )}

      {selectedPokemon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            >×</button>
            {loadingDetails || !details ? (
              <div className="flex justify-center">
                <div className="border-4 border-gray-200 border-t-blue-500 rounded-full w-12 h-12 animate-spin" />
              </div>
            ) : (
              <div className="text-center">
                <img
                  src={details.sprites.other['official-artwork'].front_default}
                  alt={details.name}
                  className="w-32 h-32 mx-auto"
                />
                <h2 className="text-2xl font-bold capitalize mt-2">{details.name}</h2>
                <div className="flex justify-center space-x-2 mt-2">
                  {details.types.map(t => (
                    <span
                      key={t.slot}
                      className={`px-2 py-1 rounded-full text-sm capitalize ${typeColors[t.type.name] || 'bg-gray-200 text-gray-800'}`}
                    >
                      {t.type.name}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 text-left">
                  <div><strong>Height:</strong> {details.height}</div>
                  <div><strong>Weight:</strong> {details.weight}</div>
                  <div><strong>Base Exp:</strong> {details.base_experience}</div>
                  <div><strong>Order:</strong> {details.order}</div>
                </div>
                <div className="mt-4 text-left">
                  <h3 className="font-semibold">Abilities:</h3>
                  <ul className="list-disc list-inside">
                    {details.abilities.map(a => (
                      <li key={a.slot} className="capitalize">{a.ability.name}{a.is_hidden ? ' (hidden)' : ''}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 text-left">
                  <h3 className="font-semibold mb-2"></h3>
                  <button
                    onClick={() => audioRef.current.play()}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Play Cry
                  </button>
                  <audio ref={audioRef} src={details.cries?.latest} />
                </div>
                <div className="mt-4 text-left">
                  <h3 className="font-semibold mb-2">Stats:</h3>
                  {details.stats.map(s => (
                    <div key={s.stat.name} className="mb-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{s.stat.name}</span>
                        <span>{s.base_stat}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${statColors[s.stat.name] || 'bg-gray-500'}`}
                          style={{ width: `${(s.base_stat / 255) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
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

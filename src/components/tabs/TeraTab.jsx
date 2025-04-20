import React, { useState, useMemo } from 'react';
import typeColors from '../../constants/typeColors';

export default function TeraTab({ types = [] }) {
  const [selectedTeraType, setSelectedTeraType] = useState('normal');
  
  // Type effectiveness data
  const typeEffectiveness = useMemo(() => {
    // Define type effectiveness chart
    const effectiveness = {
      normal: {
        superEffective: ["fighting"],
        notVeryEffective: [],
        noEffect: ["ghost"],
        // All other types deal normal damage
      },
      fire: {
        superEffective: ["water", "ground", "rock"],
        notVeryEffective: ["fire", "grass", "ice", "bug", "steel", "fairy"],
        noEffect: [],
      },
      water: {
        superEffective: ["electric", "grass"],
        notVeryEffective: ["fire", "water", "ice", "steel"],
        noEffect: [],
      },
      electric: {
        superEffective: ["ground"],
        notVeryEffective: ["electric", "flying", "steel"],
        noEffect: [],
      },
      grass: {
        superEffective: ["fire", "ice", "poison", "flying", "bug"],
        notVeryEffective: ["water", "electric", "grass", "ground"],
        noEffect: [],
      },
      ice: {
        superEffective: ["fire", "fighting", "rock", "steel"],
        notVeryEffective: ["ice"],
        noEffect: [],
      },
      fighting: {
        superEffective: ["flying", "psychic", "fairy"],
        notVeryEffective: ["bug", "rock", "dark"],
        noEffect: [],
      },
      poison: {
        superEffective: ["ground", "psychic"],
        notVeryEffective: ["grass", "fighting", "poison", "bug", "fairy"],
        noEffect: [],
      },
      ground: {
        superEffective: ["water", "grass", "ice"],
        notVeryEffective: ["poison", "rock"],
        noEffect: ["electric"],
      },
      flying: {
        superEffective: ["electric", "ice", "rock"],
        notVeryEffective: ["grass", "fighting", "bug"],
        noEffect: ["ground"],
      },
      psychic: {
        superEffective: ["bug", "ghost", "dark"],
        notVeryEffective: ["fighting", "psychic"],
        noEffect: [],
      },
      bug: {
        superEffective: ["fire", "flying", "rock"],
        notVeryEffective: ["grass", "fighting", "ground"],
        noEffect: [],
      },
      rock: {
        superEffective: ["water", "grass", "fighting", "ground", "steel"],
        notVeryEffective: ["normal", "fire", "poison", "flying"],
        noEffect: [],
      },
      ghost: {
        superEffective: ["ghost", "dark"],
        notVeryEffective: ["poison", "bug"],
        noEffect: ["normal", "fighting"],
      },
      dragon: {
        superEffective: ["ice", "dragon", "fairy"],
        notVeryEffective: ["fire", "water", "electric", "grass"],
        noEffect: [],
      },
      dark: {
        superEffective: ["fighting", "bug", "fairy"],
        notVeryEffective: ["ghost", "dark"],
        noEffect: ["psychic"],
      },
      steel: {
        superEffective: ["fire", "fighting", "ground"],
        notVeryEffective: ["normal", "grass", "ice", "flying", "psychic", "bug", "rock", "dragon", "steel", "fairy"],
        noEffect: ["poison"],
      },
      fairy: {
        superEffective: ["poison", "steel"],
        notVeryEffective: ["fighting", "bug", "dark"],
        noEffect: ["dragon"],
      }
    };
    
    // Calculate normal effectiveness by finding types not in any of the other categories
    const allTypes = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];
    
    for (const type in effectiveness) {
      const effectiveTypes = [
        ...effectiveness[type].superEffective,
        ...effectiveness[type].notVeryEffective,
        ...effectiveness[type].noEffect
      ];
      
      effectiveness[type].normalEffective = allTypes.filter(t => !effectiveTypes.includes(t));
    }
    
    return effectiveness;
  }, []);
  
  // Get Pokemon's default types for initial selection
  const pokemonDefaultType = types.length > 0 ? types[0].type.name : 'normal';
  
  // Select current effectiveness based on selected Tera type
  const currentEffectiveness = typeEffectiveness[selectedTeraType] || typeEffectiveness.normal;
  
  // Function to get type badge color
  const getTypeColor = (type) => {
    return typeColors[type] || typeColors.normal;
  };
  
  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      {/* Tera Type Selection */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">Select Tera Type</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {Object.keys(typeEffectiveness).map(type => (
            <button
              key={type}
              onClick={() => setSelectedTeraType(type)}
              className={`px-2 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                selectedTeraType === type 
                  ? `${getTypeColor(type)} ring-2 ring-offset-2 ring-blue-500` 
                  : `${getTypeColor(type)} opacity-70 hover:opacity-100`
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      {/* Current Pokemon & Tera Type */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4 text-center">
        <div className="flex justify-center gap-3 mb-2">
          {types.map((typeObj) => (
            <span
              key={typeObj.type.name}
              className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(typeObj.type.name)}`}
            >
              {typeObj.type.name}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium">Terastallized as:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm capitalize font-semibold ${getTypeColor(selectedTeraType)}`}
          >
            {selectedTeraType}
          </span>
        </div>
      </div>
      
      {/* Type Effectiveness Sections */}
      <div className="space-y-3">
        {/* Super Effective (x2) */}
        <div className="bg-red-50 border border-red-100 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-red-800 mb-2">Super Effective (x2)</h4>
          <div className="flex flex-wrap gap-1">
            {currentEffectiveness.superEffective.length > 0 ? (
              currentEffectiveness.superEffective.map(type => (
                <span
                  key={type}
                  className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(type)}`}
                >
                  {type}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500">No types are super effective</span>
            )}
          </div>
        </div>
        
        {/* Normal Damage (x1) */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Normal Damage (x1)</h4>
          <div className="flex flex-wrap gap-1">
            {currentEffectiveness.normalEffective.map(type => (
              <span
                key={type}
                className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(type)}`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
        
        {/* Not Very Effective (x0.5) */}
        <div className="bg-green-50 border border-green-100 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-green-800 mb-2">Not Very Effective (x0.5)</h4>
          <div className="flex flex-wrap gap-1">
            {currentEffectiveness.notVeryEffective.length > 0 ? (
              currentEffectiveness.notVeryEffective.map(type => (
                <span
                  key={type}
                  className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(type)}`}
                >
                  {type}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500">No types are resisted</span>
            )}
          </div>
        </div>
        
        {/* No Effect (x0) */}
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-purple-800 mb-2">No Effect (x0)</h4>
          <div className="flex flex-wrap gap-1">
            {currentEffectiveness.noEffect.length > 0 ? (
              currentEffectiveness.noEffect.map(type => (
                <span
                  key={type}
                  className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(type)}`}
                >
                  {type}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500">No types are completely ineffective</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
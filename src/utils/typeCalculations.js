// Type effectiveness data - What types are strong/weak against each type
export const typeEffectiveness = {
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
  
  // Type offensive data - What types each type is strong against
  export const typeOffensive = {
    normal: {
      superEffective: [],
      notVeryEffective: ["rock", "steel"],
      noEffect: ["ghost"],
    },
    fire: {
      superEffective: ["grass", "ice", "bug", "steel"],
      notVeryEffective: ["fire", "water", "rock", "dragon"],
      noEffect: [],
    },
    water: {
      superEffective: ["fire", "ground", "rock"],
      notVeryEffective: ["water", "grass", "dragon"],
      noEffect: [],
    },
    electric: {
      superEffective: ["water", "flying"],
      notVeryEffective: ["electric", "grass", "dragon"],
      noEffect: ["ground"],
    },
    grass: {
      superEffective: ["water", "ground", "rock"],
      notVeryEffective: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"],
      noEffect: [],
    },
    ice: {
      superEffective: ["grass", "ground", "flying", "dragon"],
      notVeryEffective: ["fire", "water", "ice", "steel"],
      noEffect: [],
    },
    fighting: {
      superEffective: ["normal", "ice", "rock", "dark", "steel"],
      notVeryEffective: ["poison", "flying", "psychic", "bug", "fairy"],
      noEffect: ["ghost"],
    },
    poison: {
      superEffective: ["grass", "fairy"],
      notVeryEffective: ["poison", "ground", "rock", "ghost"],
      noEffect: ["steel"],
    },
    ground: {
      superEffective: ["fire", "electric", "poison", "rock", "steel"],
      notVeryEffective: ["grass", "bug"],
      noEffect: ["flying"],
    },
    flying: {
      superEffective: ["grass", "fighting", "bug"],
      notVeryEffective: ["electric", "rock", "steel"],
      noEffect: [],
    },
    psychic: {
      superEffective: ["fighting", "poison"],
      notVeryEffective: ["psychic", "steel"],
      noEffect: ["dark"],
    },
    bug: {
      superEffective: ["grass", "psychic", "dark"],
      notVeryEffective: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"],
      noEffect: [],
    },
    rock: {
      superEffective: ["fire", "ice", "flying", "bug"],
      notVeryEffective: ["fighting", "ground", "steel"],
      noEffect: [],
    },
    ghost: {
      superEffective: ["psychic", "ghost"],
      notVeryEffective: ["dark"],
      noEffect: ["normal"],
    },
    dragon: {
      superEffective: ["dragon"],
      notVeryEffective: ["steel"],
      noEffect: ["fairy"],
    },
    dark: {
      superEffective: ["psychic", "ghost"],
      notVeryEffective: ["fighting", "dark", "fairy"],
      noEffect: [],
    },
    steel: {
      superEffective: ["ice", "rock", "fairy"],
      notVeryEffective: ["fire", "water", "electric", "steel"],
      noEffect: [],
    },
    fairy: {
      superEffective: ["fighting", "dragon", "dark"],
      notVeryEffective: ["fire", "poison", "steel"],
      noEffect: [],
    }
  };
  
  // Calculate normal effectiveness by finding types not in any other categories
  const allTypes = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", 
                  "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", 
                  "dragon", "dark", "steel", "fairy"];
  
  // Initialize normalEffective for each type
  for (const type in typeEffectiveness) {
    const effectiveTypes = [
      ...typeEffectiveness[type].superEffective,
      ...typeEffectiveness[type].notVeryEffective,
      ...typeEffectiveness[type].noEffect
    ];
    
    typeEffectiveness[type].normalEffective = allTypes.filter(t => !effectiveTypes.includes(t));
  }
  
  for (const type in typeOffensive) {
    const effectiveTypes = [
      ...typeOffensive[type].superEffective,
      ...typeOffensive[type].notVeryEffective,
      ...typeOffensive[type].noEffect
    ];
    
    typeOffensive[type].normalEffective = allTypes.filter(t => !effectiveTypes.includes(t));
  }
  
  /**
   * Calculate combined offensive effectiveness for original Pokemon types
   * @param {Array} pokemonTypes - Array of type objects from the Pokemon
   * @returns {Object} Combined offensive effectiveness
   */
  export function calculateCombinedOffensive(pokemonTypes) {
    // Default to empty arrays if no types
    if (!pokemonTypes || pokemonTypes.length === 0) {
      return {
        superEffective: [],
        notVeryEffective: [],
        noEffect: [],
        normalEffective: []
      };
    }
    
    // Extract type names
    const typeNames = pokemonTypes.map(t => t.type.name);
    
    // Initialize combined results
    const combined = {
      superEffective: new Set(),
      notVeryEffective: new Set(),
      noEffect: new Set(),
      normalEffective: new Set()
    };
    
    // Track the effectiveness multiplier for each type
    const effectivenessMap = {};
    allTypes.forEach(type => {
      effectivenessMap[type] = 1; // Start with normal effectiveness
    });
    
    // Calculate combined effectiveness
    typeNames.forEach(typeName => {
      const offense = typeOffensive[typeName] || { superEffective: [], notVeryEffective: [], noEffect: [] };
      
      // Apply effectiveness multipliers
      offense.superEffective.forEach(type => {
        effectivenessMap[type] *= 2;
      });
      
      offense.notVeryEffective.forEach(type => {
        effectivenessMap[type] *= 0.5;
      });
      
      offense.noEffect.forEach(type => {
        effectivenessMap[type] = 0;
      });
    });
    
    // Categorize based on final multipliers
    Object.entries(effectivenessMap).forEach(([type, multiplier]) => {
      if (multiplier === 0) {
        combined.noEffect.add(type);
      } else if (multiplier > 1) {
        combined.superEffective.add(type);
      } else if (multiplier < 1) {
        combined.notVeryEffective.add(type);
      } else {
        combined.normalEffective.add(type);
      }
    });
    
    // Convert Sets to arrays
    return {
      superEffective: Array.from(combined.superEffective),
      notVeryEffective: Array.from(combined.notVeryEffective),
      noEffect: Array.from(combined.noEffect),
      normalEffective: Array.from(combined.normalEffective)
    };
  }
  
  /**
   * Calculate best types to use against a specific Pokemon with a Tera type
   * @param {Array} originalTypes - Array of type objects of the Pokemon
   * @param {String} teraType - Selected Tera type
   * @returns {Object} Recommended types
   */
  export function calculateBestTypes(originalTypes, teraType) {
    // Get the original Pokemon types as strings
    const originalTypeNames = originalTypes.map(t => t.type.name);
    
    // Get types that are super effective against the selected Tera type
    const superEffectiveAgainstTera = typeEffectiveness[teraType].superEffective;
    
    // Create defensive rating for each type against the original Pokemon types
    // Higher is better (more resistant)
    const defensiveRatings = {};
    
    // Initialize ratings (higher is better defensively)
    allTypes.forEach(type => {
      defensiveRatings[type] = 0;
    });
    
    // For each original type, calculate how well other types defend against it
    originalTypeNames.forEach(originalType => {
      // Types that are weak to the original type (take super effective damage)
      typeEffectiveness[originalType].superEffective.forEach(weakType => {
        defensiveRatings[weakType] -= 2; // Big penalty for weakness
      });
      
      // Types that resist the original type
      typeEffectiveness[originalType].notVeryEffective.forEach(resistType => {
        defensiveRatings[resistType] += 1;
      });
      
      // Types that are immune to the original type
      typeEffectiveness[originalType].noEffect.forEach(immuneType => {
        defensiveRatings[immuneType] += 3; // Big bonus for immunity
      });
    });
    
    // Create a score for each type considering both offense against Tera and defense against original
    const typeScores = {};
    
    allTypes.forEach(type => {
      // Base score is defensive rating
      typeScores[type] = defensiveRatings[type];
      
      // Huge bonus for being super effective against Tera type
      if (superEffectiveAgainstTera.includes(type)) {
        typeScores[type] += 5;
      }
      
      // Penalty for being weak to Tera type
      if (typeEffectiveness[type].superEffective.includes(teraType)) {
        typeScores[type] -= 3;
      }
    });
    
    // Find best single type based on score
    const bestSingleTypes = [...allTypes]
      .sort((a, b) => typeScores[b] - typeScores[a])
      .filter(type => superEffectiveAgainstTera.includes(type)) // Must be super effective against Tera
      .slice(0, 3); // Top 3
    
    // Find best dual types
    const dualTypeCombinations = [];
    
    // For each possible primary type (preferably super effective against Tera)
    allTypes.forEach(type1 => {
      // Calculate offensive bonus for this type against Tera
      const type1OffensiveBonus = superEffectiveAgainstTera.includes(type1) ? 5 : 0;
      
      // Consider pairing with every other type
      allTypes.forEach(type2 => {
        if (type1 !== type2) {
          // Calculate offensive bonus for second type
          const type2OffensiveBonus = superEffectiveAgainstTera.includes(type2) ? 5 : 0;
          
          // Combined score considers both types' defensive ratings plus at least one being super effective
          const combinedScore = defensiveRatings[type1] + defensiveRatings[type2] + 
                                Math.max(type1OffensiveBonus, type2OffensiveBonus);
          
          // Type combinations should have at least one type super effective against Tera
          if (type1OffensiveBonus > 0 || type2OffensiveBonus > 0) {
            dualTypeCombinations.push({
              types: [type1, type2],
              score: combinedScore
            });
          }
        }
      });
    });
    
    // Sort dual types by score
    const bestDualTypes = dualTypeCombinations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Take top 5
      .map(combo => combo.types);
    
    return {
      bestSingleType: bestSingleTypes.length > 0 ? bestSingleTypes[0] : null,
      alternativeSingleTypes: bestSingleTypes.slice(1),
      bestDualTypes: bestDualTypes
    };
  }
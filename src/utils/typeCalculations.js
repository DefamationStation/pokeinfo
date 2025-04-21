// Type effectiveness data - What types are strong/weak against each type
export const typeEffectiveness = {
  normal: {
    superEffective: ["fighting"],
    notVeryEffective: [],
    noEffect: ["ghost"],
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
 * This algorithm ensures we never recommend types that are weak to the original typing
 * 
 * @param {Array} originalTypes - Array of type objects of the Pokemon
 * @param {String} teraType - Selected Tera type
 * @returns {Object} Recommended types
 */
export function calculateBestTypes(originalTypes, teraType) {
  // Get the original Pokemon types as strings
  const originalTypeNames = originalTypes.map(t => t.type.name);
  
  // Get types that are super effective against the selected Tera type
  const superEffectiveAgainstTera = typeEffectiveness[teraType]?.superEffective || [];
  
  // Find types that are vulnerable to the original Pokemon types
  const vulnerableTypes = new Set();
  
  originalTypeNames.forEach(originalType => {
    // Any type that the original type is super effective against is vulnerable
    if (typeOffensive[originalType] && typeOffensive[originalType].superEffective) {
      typeOffensive[originalType].superEffective.forEach(type => {
        vulnerableTypes.add(type);
      });
    }
  });
  
  // Filter out vulnerable types from all types to get safe types
  const safeTypes = allTypes.filter(type => !vulnerableTypes.has(type));
  
  // Find types that are both safe and super effective against Tera type
  const safeAndEffective = superEffectiveAgainstTera.filter(type => !vulnerableTypes.has(type));
  
  // Calculate scores for safe types
  const typeScores = {};
  
  safeTypes.forEach(type => {
    // Start with a base score
    typeScores[type] = 0;
    
    // Bonus for being super effective against Tera type
    if (superEffectiveAgainstTera.includes(type)) {
      typeScores[type] += 10;
    }
    
    // Check if this type is vulnerable to any of the original types (double-check)
    let isVulnerableToOriginal = false;
    
    originalTypeNames.forEach(originalType => {
      if (typeOffensive[originalType] && 
          typeOffensive[originalType].superEffective && 
          typeOffensive[originalType].superEffective.includes(type)) {
        isVulnerableToOriginal = true;
      }
    });
    
    // Apply a large penalty if this type is vulnerable to the original Pokemon
    if (isVulnerableToOriginal) {
      typeScores[type] -= 20; // Large penalty to make it very unlikely to be recommended
    }
    
    // Calculate defensive value against original types - THIS IS THE KEY FIX
    originalTypeNames.forEach(originalType => {
      // We need to use typeOffensive here, not typeEffectiveness!
      // Check if this type resists attacks from the original type
      if (typeOffensive[originalType] && typeOffensive[originalType].notVeryEffective && 
          typeOffensive[originalType].notVeryEffective.includes(type)) {
        typeScores[type] += 3;
      }
      
      // Check if this type is immune to the original type
      if (typeOffensive[originalType] && typeOffensive[originalType].noEffect && 
          typeOffensive[originalType].noEffect.includes(type)) {
        typeScores[type] += 5;
      }
    });
    
    // Penalty for being weak to Tera type
    if (typeEffectiveness[teraType]?.superEffective?.includes(type)) {
      typeScores[type] -= 2;
    }
    
    // Bonus for resisting Tera type
    if (typeEffectiveness[teraType]?.notVeryEffective?.includes(type)) {
      typeScores[type] += 1;
    }
    
    // Bonus for being immune to Tera type
    if (typeEffectiveness[teraType]?.noEffect?.includes(type)) {
      typeScores[type] += 2;
    }
  });
  
  // Get best single types - prioritize types that are both safe AND super effective
  let bestSingleTypes = safeAndEffective.length > 0 ? 
    [...safeAndEffective].sort((a, b) => typeScores[b] - typeScores[a]) : 
    [...safeTypes].sort((a, b) => typeScores[b] - typeScores[a]);
  
  // Remove any types with negative scores (types that are bad choices)
  bestSingleTypes = bestSingleTypes.filter(type => typeScores[type] > 0);
  
  // For dual types, we're looking for combinations where:
  // 1. Neither type is vulnerable to original types
  // 2. At least one type is super effective against Tera (if possible)
  
  const dualTypePairs = [];
  
  for (let i = 0; i < safeTypes.length; i++) {
    const type1 = safeTypes[i];
    
    // Skip if this type has a negative score (vulnerable)
    if (typeScores[type1] <= 0) continue;
    
    const type1EffectiveVsTera = superEffectiveAgainstTera.includes(type1);
    
    for (let j = i + 1; j < safeTypes.length; j++) {
      const type2 = safeTypes[j];
      
      // Skip if this type has a negative score (vulnerable)
      if (typeScores[type2] <= 0) continue;
      
      const type2EffectiveVsTera = superEffectiveAgainstTera.includes(type2);
      
      // Prioritize pairs where at least one is super effective against Tera
      const offensiveBonus = (type1EffectiveVsTera || type2EffectiveVsTera) ? 10 : 0;
      
      // Calculate coverage score (how well types complement each other)
      let coverageScore = 0;
      
      // Check how type2 covers type1's weaknesses
      if (typeEffectiveness[type1]?.superEffective) {
        typeEffectiveness[type1].superEffective.forEach(weakness => {
          if (typeEffectiveness[weakness]) {
            if (typeEffectiveness[weakness].notVeryEffective?.includes(type2) || 
                typeEffectiveness[weakness].noEffect?.includes(type2)) {
              coverageScore += 2;
            }
          }
        });
      }
      
      // Check how type1 covers type2's weaknesses
      if (typeEffectiveness[type2]?.superEffective) {
        typeEffectiveness[type2].superEffective.forEach(weakness => {
          if (typeEffectiveness[weakness]) {
            if (typeEffectiveness[weakness].notVeryEffective?.includes(type1) || 
                typeEffectiveness[weakness].noEffect?.includes(type1)) {
              coverageScore += 2;
            }
          }
        });
      }
      
      // Combined score
      const combinedScore = typeScores[type1] + typeScores[type2] + coverageScore + offensiveBonus;
      
      // Only include combinations with positive scores
      if (combinedScore > 0) {
        dualTypePairs.push({
          types: [type1, type2],
          score: combinedScore
        });
      }
    }
  }
  
  // Sort dual types by score
  const bestDualTypes = dualTypePairs
    .sort((a, b) => b.score - a.score)
    .slice(0, 5) // Take top 5
    .map(combo => combo.types);
  
  return {
    bestSingleType: bestSingleTypes.length > 0 ? bestSingleTypes[0] : null,
    alternativeSingleTypes: bestSingleTypes.slice(1, 3),
    bestDualTypes: bestDualTypes
  };
}
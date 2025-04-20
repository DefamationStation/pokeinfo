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
   * This algorithm prioritizes safety from the original types first, then looks at effectiveness against the Tera type
   * 
   * @param {Array} originalTypes - Array of type objects of the Pokemon
   * @param {String} teraType - Selected Tera type
   * @returns {Object} Recommended types
   */
  export function calculateBestTypes(originalTypes, teraType) {
    // Get the original Pokemon types as strings
    const originalTypeNames = originalTypes.map(t => t.type.name);
    
    // Get types that are super effective against the Tera type
    const superEffectiveAgainstTera = typeEffectiveness[teraType].superEffective;
    
    // First, create a map of all types with their vulnerability to original types
    const typeVulnerability = {};
    
    allTypes.forEach(type => {
      // For each type, check if the original Pokemon types are super effective against it
      let isSuperEffective = false;
      
      originalTypeNames.forEach(originalType => {
        // If the original type is super effective against this type, mark it as vulnerable
        if (typeEffectiveness[originalType].superEffective.includes(type)) {
          isSuperEffective = true;
        }
      });
      
      // Store vulnerability status
      typeVulnerability[type] = isSuperEffective;
    });
    
    // RULE 1: Filter out any types that take super effective damage from original types
    const safeTypes = allTypes.filter(type => !typeVulnerability[type]);
    
    // Now calculate scores ONLY for safe types
    const typeScores = {};
    
    safeTypes.forEach(type => {
      // Start with a base score
      typeScores[type] = 0;
      
      // BIG bonus for being super effective against Tera type
      if (superEffectiveAgainstTera.includes(type)) {
        typeScores[type] += 10;
      }
      
      // Calculate defensive value against original types
      originalTypeNames.forEach(originalType => {
        // Bonus for resisting the original type
        if (typeEffectiveness[originalType].notVeryEffective.includes(type)) {
          typeScores[type] += 3;
        }
        
        // Bigger bonus for being immune to the original type
        if (typeEffectiveness[originalType].noEffect.includes(type)) {
          typeScores[type] += 5;
        }
      });
      
      // Penalty for being weak to Tera type
      if (typeEffectiveness[teraType].superEffective.includes(type)) {
        typeScores[type] -= 2;
      }
      
      // Bonus for resisting Tera type
      if (typeEffectiveness[teraType].notVeryEffective.includes(type)) {
        typeScores[type] += 1;
      }
      
      // Bonus for being immune to Tera type
      if (typeEffectiveness[teraType].noEffect.includes(type)) {
        typeScores[type] += 2;
      }
    });
    
    // Find best single types - must be safe from original types
    const bestSingleTypesSafe = [...safeTypes]
      .filter(type => superEffectiveAgainstTera.includes(type)) // Must be super effective against Tera
      .sort((a, b) => typeScores[b] - typeScores[a]);
    
    // If we can't find types that are both safe and super effective against Tera,
    // look for types that are at least safe from original types
    const bestSingleTypes = bestSingleTypesSafe.length > 0 ? 
      bestSingleTypesSafe : 
      [...safeTypes].sort((a, b) => typeScores[b] - typeScores[a]);
    
    // As a backup, if no safe types at all, prioritize types super effective against Tera
    // that minimize damage from original typing
    const backupTypes = bestSingleTypes.length > 0 ? 
      bestSingleTypes : 
      [...allTypes]
        .filter(type => superEffectiveAgainstTera.includes(type))
        .sort((a, b) => {
          // Count how many original types are super effective against this type
          const aVulnerabilities = originalTypeNames.filter(originalType => 
            typeEffectiveness[originalType].superEffective.includes(a)).length;
          const bVulnerabilities = originalTypeNames.filter(originalType => 
            typeEffectiveness[originalType].superEffective.includes(b)).length;
          
          // Sort by fewer vulnerabilities
          return aVulnerabilities - bVulnerabilities;
        });
    
    // For dual types, we're looking for combinations where:
    // 1. Neither type is weak to original types (if possible)
    // 2. At least one type is super effective against Tera
    // 3. The types cover each other's weaknesses well
    
    // First, calculate how well each type pair covers each other
    const dualTypePairs = [];
    
    for (let i = 0; i < safeTypes.length; i++) {
      const type1 = safeTypes[i];
      const type1EffectiveVsTera = superEffectiveAgainstTera.includes(type1);
      
      for (let j = i + 1; j < safeTypes.length; j++) {
        const type2 = safeTypes[j];
        const type2EffectiveVsTera = superEffectiveAgainstTera.includes(type2);
        
        // Require at least one type to be super effective against Tera
        if (!type1EffectiveVsTera && !type2EffectiveVsTera) continue;
        
        // Calculate coverage score
        let coverageScore = 0;
        
        // Check how type2 covers type1's weaknesses
        typeEffectiveness[type1].superEffective.forEach(weakness => {
          if (typeEffectiveness[weakness].notVeryEffective.includes(type2)) {
            coverageScore += 2;
          }
          if (typeEffectiveness[weakness].noEffect.includes(type2)) {
            coverageScore += 3;
          }
        });
        
        // Check how type1 covers type2's weaknesses
        typeEffectiveness[type2].superEffective.forEach(weakness => {
          if (typeEffectiveness[weakness].notVeryEffective.includes(type1)) {
            coverageScore += 2;
          }
          if (typeEffectiveness[weakness].noEffect.includes(type1)) {
            coverageScore += 3;
          }
        });
        
        // Calculate combined score using individual scores plus coverage
        const combinedScore = typeScores[type1] + typeScores[type2] + coverageScore;
        
        dualTypePairs.push({
          types: [type1, type2],
          score: combinedScore
        });
      }
    }
    
    // If we couldn't find good pure safe dual types, expand our search
    const expandedDualTypePairs = dualTypePairs.length >= 3 ? dualTypePairs : (() => {
      const pairs = [];
      
      // Try pairing safe types with any type that's super effective against Tera
      safeTypes.forEach(safeType => {
        superEffectiveAgainstTera.forEach(effectiveType => {
          if (safeType !== effectiveType && !typeVulnerability[effectiveType]) {
            // Calculate a score with higher weight on the safe type
            const combinedScore = (typeScores[safeType] || 0) * 2 + 10; // Safe + effective boost
            
            pairs.push({
              types: [safeType, effectiveType],
              score: combinedScore
            });
          }
        });
      });
      
      return pairs.length > 0 ? pairs : dualTypePairs;
    })();
    
    // Sort dual types by score
    const sortedDualTypes = expandedDualTypePairs
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Take top 5
      .map(combo => combo.types);
    
    return {
      bestSingleType: bestSingleTypes.length > 0 ? bestSingleTypes[0] : backupTypes[0],
      alternativeSingleTypes: bestSingleTypes.length > 0 ? 
        bestSingleTypes.slice(1, 3) : 
        backupTypes.slice(1, 3),
      bestDualTypes: sortedDualTypes
    };
  }
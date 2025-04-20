import React, { useState, useEffect } from 'react';
import typeColors from '../../constants/typeColors';

export default function MovesTab({ moves, pokemonName, pokemonImage }) {
  const [moveDetails, setMoveDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'level', direction: 'ascending' });
  
  useEffect(() => {
    const fetchAllMoves = async () => {
      setLoading(true);
      const moveDetailsObj = {};
      
      // First check localStorage and create a list of moves to fetch
      const movesToFetch = [];
      
      moves.forEach(moveInfo => {
        const moveName = moveInfo.move.name;
        const storageKey = 'move_' + moveName;
        
        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object') {
              moveDetailsObj[moveName] = parsed;
            } else {
              movesToFetch.push(moveInfo);
            }
          } else {
            movesToFetch.push(moveInfo);
          }
        } catch (e) {
          movesToFetch.push(moveInfo);
        }
      });
      
      // Fetch missing move details
      const fetchPromises = movesToFetch.map(moveInfo => {
        return fetch(moveInfo.move.url)
          .then(res => res.json())
          .then(data => {
            moveDetailsObj[moveInfo.move.name] = data;
            localStorage.setItem('move_' + moveInfo.move.name, JSON.stringify(data));
            return data;
          })
          .catch(err => {
            console.error(`Failed to fetch details for ${moveInfo.move.name}:`, err);
            return null;
          });
      });
      
      await Promise.all(fetchPromises);
      setMoveDetails(moveDetailsObj);
      setLoading(false);
    };
    
    fetchAllMoves();
  }, [moves]);
  
  // Helper to get earliest level learned
  const getLearnLevel = (moveInfo) => {
    const levels = moveInfo.version_group_details
      .filter(d => d.level_learned_at > 0)
      .map(d => d.level_learned_at);
    
    return levels.length > 0 ? Math.min(...levels) : 0;
  };
  
  // Helper to get the most recent learn method
  const getLearnMethod = (moveInfo) => {
    const details = moveInfo.version_group_details;
    return details.length > 0 
      ? details[details.length - 1].move_learn_method.name 
      : 'level-up';
  };
  
  // Format name for display
  const formatName = (name) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Prepare the move data
  const prepareMovesData = () => {
    return moves.map(moveInfo => {
      const name = moveInfo.move.name;
      const details = moveDetails[name];
      const level = getLearnLevel(moveInfo);
      const method = getLearnMethod(moveInfo);
      
      return {
        name,
        formattedName: formatName(name),
        level,
        method,
        type: details?.type?.name || '',
        category: details?.damage_class?.name || '',
        power: details?.power || '—',
        accuracy: details?.accuracy ? `${details.accuracy}%` : '—%',
        pp: details?.pp || '—',
        details
      };
    });
  };
  
  // Format method display
  const getMethodDisplay = (method, level) => {
    if (method === 'level-up' && level > 0) {
      return level;
    } 
    if (method === 'egg') {
      return 'Egg';
    }
    if (method === 'machine') {
      return 'TM/HM';
    }
    if (method === 'tutor') {
      return 'Tutor';
    }
    return '—';
  };
  
  // Sort the moves
  const sortedMoves = () => {
    const moveData = prepareMovesData();
    
    return [...moveData].sort((a, b) => {
      // First sort by method to group similar methods together
      if (a.method !== b.method) {
        // Level-up moves first
        if (a.method === 'level-up') return -1;
        if (b.method === 'level-up') return 1;
        
        // Then egg moves
        if (a.method === 'egg') return -1;
        if (b.method === 'egg') return 1;
        
        // Then TM/HM moves
        if (a.method === 'machine') return -1;
        if (b.method === 'machine') return 1;
      }
      
      // For the same method type, sort by the current sort configuration
      if (sortConfig.key === 'level') {
        // Special sorting for level
        if (a.level === b.level) {
          // If levels are the same, sort by name
          return a.formattedName.localeCompare(b.formattedName);
        }
        return sortConfig.direction === 'ascending' 
          ? a.level - b.level 
          : b.level - a.level;
      }
      
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'ascending'
          ? a.formattedName.localeCompare(b.formattedName)
          : b.formattedName.localeCompare(a.formattedName);
      }
      
      if (sortConfig.key === 'type') {
        return sortConfig.direction === 'ascending'
          ? (a.type || '').localeCompare(b.type || '')
          : (b.type || '').localeCompare(a.type || '');
      }
      
      if (sortConfig.key === 'category') {
        return sortConfig.direction === 'ascending'
          ? (a.category || '').localeCompare(b.category || '')
          : (b.category || '').localeCompare(a.category || '');
      }
      
      if (sortConfig.key === 'power') {
        const aPower = a.power === '—' ? -1 : a.power;
        const bPower = b.power === '—' ? -1 : b.power;
        return sortConfig.direction === 'ascending' 
          ? aPower - bPower 
          : bPower - aPower;
      }
      
      if (sortConfig.key === 'accuracy') {
        const aAcc = a.accuracy === '—%' ? -1 : parseInt(a.accuracy);
        const bAcc = b.accuracy === '—%' ? -1 : parseInt(b.accuracy);
        return sortConfig.direction === 'ascending' 
          ? aAcc - bAcc 
          : bAcc - aAcc;
      }
      
      if (sortConfig.key === 'pp') {
        const aPP = a.pp === '—' ? -1 : a.pp;
        const bPP = b.pp === '—' ? -1 : b.pp;
        return sortConfig.direction === 'ascending' 
          ? aPP - bPP 
          : bPP - aPP;
      }
      
      return 0;
    });
  };
  
  // Handle column header click for sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return '↕️';
    }
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };
  
  // Get the CSS class for a move type
  const getTypeClass = (type) => {
    return typeColors[type] || 'bg-gray-400 text-white';
  };
  
  // Get the CSS class for move category
  const getCategoryClass = (category) => {
    if (category === 'physical') {
      return 'bg-orange-600 text-white';
    } else if (category === 'special') {
      return 'bg-blue-500 text-white';
    } else if (category === 'status') {
      return 'bg-gray-400 text-white';
    }
    return '';
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="border-4 border-gray-200 border-t-red-500 rounded-full w-10 h-10 animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Static header for Pokémon name and image */}
      <div className="flex flex-col items-center py-2 border-b bg-white z-10">
        {pokemonImage && (
          <img src={pokemonImage} alt={pokemonName} className="w-24 h-24 object-contain mb-1" />
        )}
        {pokemonName && (
          <h2 className="text-xl font-bold capitalize mb-1">{pokemonName}</h2>
        )}
      </div>
      
      {/* Table with sticky header and body in a single table for alignment */}
      <div className="relative overflow-hidden">
        <div className="overflow-y-auto" style={{ maxHeight: '28rem' }}>
          <table className="min-w-full table-fixed bg-white">
            <colgroup>
              <col className="w-20" />
              <col className="flex-1" />
              <col className="w-28" />
              <col className="w-28" />
              <col className="w-20" />
              <col className="w-20" />
              <col className="w-16" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
              <tr className="bg-gray-100 text-gray-600 text-left text-sm">
                <th className="py-2 px-3 cursor-pointer font-medium" onClick={() => handleSort('level')}>
                  Level {getSortIcon('level')}
                </th>
                <th className="py-2 px-3 cursor-pointer font-medium" onClick={() => handleSort('name')}>
                  Move {getSortIcon('name')}
                </th>
                <th className="py-2 px-3 cursor-pointer font-medium" onClick={() => handleSort('type')}>
                  Type {getSortIcon('type')}
                </th>
                <th className="py-2 px-3 cursor-pointer font-medium" onClick={() => handleSort('category')}>
                  Cat. {getSortIcon('category')}
                </th>
                <th className="py-2 px-3 cursor-pointer text-right font-medium" onClick={() => handleSort('power')}>
                  Pwr. {getSortIcon('power')}
                </th>
                <th className="py-2 px-3 cursor-pointer text-right font-medium" onClick={() => handleSort('accuracy')}>
                  Acc. {getSortIcon('accuracy')}
                </th>
                <th className="py-2 px-3 cursor-pointer text-right font-medium" onClick={() => handleSort('pp')}>
                  PP {getSortIcon('pp')}
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {sortedMoves().map((move, index) => (
                <tr 
                  key={move.name} 
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="py-2 px-3">
                    {getMethodDisplay(move.method, move.level)}
                  </td>
                  <td className="py-2 px-3">{move.formattedName}</td>
                  <td className="py-2 px-3">
                    {move.type && (
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeClass(move.type)}`}>
                        {formatName(move.type)}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {move.category && (
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryClass(move.category)}`}>
                        {formatName(move.category)}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right">{move.power}</td>
                  <td className="py-2 px-3 text-right">{move.accuracy}</td>
                  <td className="py-2 px-3 text-right">{move.pp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
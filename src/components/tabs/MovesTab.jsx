import React, { useState, useCallback, useMemo, memo } from 'react';
import typeColors from '../../constants/typeColors';
import usePokemonMoves from '../../hooks/usePokemonMoves';

// Memo-ized move row component for better performance
const MoveRow = memo(({ move, index, getTypeClass, getCategoryClass, getMethodDisplay, formatName }) => {
  return (
    <tr 
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
  );
});

// Table header component
const TableHeader = memo(({ sortConfig, handleSort, getSortIcon }) => (
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
));

export default function MovesTab({ moves, pokemonName, pokemonImage }) {
  const { moveDetails, loading, fetchProgress } = usePokemonMoves(pokemonName, moves);
  const [sortConfig, setSortConfig] = useState({ key: 'level', direction: 'ascending' });
  
  // Cache some frequently used functions
  const formatName = useCallback((name) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);
  
  // Get earliest level learned (memoized helper)
  const getLearnLevel = useCallback((moveInfo) => {
    const levels = moveInfo.version_group_details
      .filter(d => d.level_learned_at > 0)
      .map(d => d.level_learned_at);
    
    return levels.length > 0 ? Math.min(...levels) : 0;
  }, []);
  
  // Get learn method (memoized helper)
  const getLearnMethod = useCallback((moveInfo) => {
    const details = moveInfo.version_group_details;
    return details.length > 0 
      ? details[details.length - 1].move_learn_method.name 
      : 'level-up';
  }, []);
  
  // Method display (memoized helper)
  const getMethodDisplay = useCallback((method, level) => {
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
  }, []);
  
  // Type color helper (memoized)
  const getTypeClass = useCallback((type) => {
    return typeColors[type] || 'bg-gray-400 text-white';
  }, []);
  
  // Category class helper (memoized)
  const getCategoryClass = useCallback((category) => {
    if (category === 'physical') {
      return 'bg-orange-600 text-white';
    } else if (category === 'special') {
      return 'bg-blue-500 text-white';
    } else if (category === 'status') {
      return 'bg-gray-400 text-white';
    }
    return '';
  }, []);
  
  // Sort icon helper (memoized)
  const getSortIcon = useCallback((key) => {
    if (sortConfig.key !== key) {
      return '↕️';
    }
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  }, [sortConfig]);
  
  // Handle sort
  const handleSort = useCallback((key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);
  
  // Prepare and sort move data (memoized for performance)
  const preparedMoves = useMemo(() => {
    const moveData = moves.map(moveInfo => {
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
    
    return moveData;
  }, [moveDetails, moves, formatName, getLearnLevel, getLearnMethod]);
  
  // Sort the prepared moves (memoized)
  const sortedMoves = useMemo(() => {
    return [...preparedMoves].sort((a, b) => {
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
  }, [preparedMoves, sortConfig]);
  
  if (loading && Object.keys(moveDetails).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="border-4 border-gray-200 border-t-red-500 rounded-full w-10 h-10 animate-spin mb-4"></div>
        <div className="text-gray-600 text-sm">Loading moves...</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">

      
      {/* Progress indicator for data loading */}
      {loading && (
        <div className="p-2 bg-blue-50 border-b border-blue-100">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${fetchProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-center mt-1 text-gray-600">
            Loading move data: {Math.floor(fetchProgress)}%
          </div>
        </div>
      )}
      
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
            
            <TableHeader 
              sortConfig={sortConfig} 
              handleSort={handleSort} 
              getSortIcon={getSortIcon}
            />
            
            <tbody className="text-gray-700">
              {sortedMoves.map((move, index) => (
                <MoveRow
                  key={move.name}
                  move={move}
                  index={index}
                  getTypeClass={getTypeClass}
                  getCategoryClass={getCategoryClass}
                  getMethodDisplay={getMethodDisplay}
                  formatName={formatName}
                />
              ))}
              
              {sortedMoves.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No move data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
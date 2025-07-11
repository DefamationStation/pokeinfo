import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import typeColors from '../../constants/typeColors';

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

export default function MovesTab({ moves, pokemonName, pokemonImage, moveDetails, loading, fetchProgress }) {
  const [sortConfig, setSortConfig] = useState({ key: 'level', direction: 'ascending' });
  const [showLoading, setShowLoading] = useState(false);
  
  // Don't show loading indicator immediately to avoid flicker if data is cached
  useEffect(() => {
    // Only show loading indicator if loading takes more than 300ms
    if (loading) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [loading]);
  
  // Format name helper (memoized)
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
  
  const shouldShowLoading = loading && (showLoading || Object.keys(moveDetails).length === 0);
  
  if (shouldShowLoading && Object.keys(moveDetails).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <div className="border-4 border-gray-200 border-t-red-500 rounded-full w-8 h-8 animate-spin mb-2"></div>
        <div className="text-gray-600 text-sm">Loading moves...</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Progress bar for loading - smaller height */}
      <div className="h-8 mb-2 flex items-center">
        {shouldShowLoading && fetchProgress < 100 ? (
          <div className="w-full">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${fetchProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-center mt-0.5 text-gray-600">
              Loading move data: {Math.floor(fetchProgress)}%
            </div>
          </div>
        ) : null}
      </div>
      
      {/* Table with height that fits within the tab area */}
      <div className="flex-1 overflow-y-auto">
        <table className="min-w-full table-fixed bg-white">
          <colgroup>
            <col className="w-16" />
            <col className="flex-1" />
            <col className="w-24" />
            <col className="w-24" />
            <col className="w-16" />
            <col className="w-16" />
            <col className="w-16" />
          </colgroup>
          
          <TableHeader 
            sortConfig={sortConfig} 
            handleSort={handleSort} 
            getSortIcon={getSortIcon}
          />
          
          <tbody className="text-gray-700 text-sm">
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
                <td colSpan="7" className="py-4 text-center text-gray-500">
                  No move data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
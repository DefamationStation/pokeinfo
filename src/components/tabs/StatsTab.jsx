import React from 'react';
import { formatStatName, getStatColor } from '../../utils/stat';

export default function StatsTab({ stats, types = [] }) {
  // Calculate total base stats
  const totalStats = stats.reduce((total, stat) => total + stat.base_stat, 0);
  
  // Map PokeAPI stat names to specific colors
  const statColors = {
    'hp': 'bg-red-500',
    'attack': 'bg-orange-600',
    'defense': 'bg-yellow-500',
    'special-attack': 'bg-green-500',
    'special-defense': 'bg-blue-500',
    'speed': 'bg-pink-400'
  };
  
  // Get appropriate background color for each stat
  const getStatBgColor = (statName) => {
    const color = statColors[statName] || getStatColor(100); // Fallback to default
    return color.replace('bg-', 'bg-') + '/20'; // Add transparency
  };

  return (
    <div className="space-y-3 w-full max-w-md mx-auto">
      {/* Types Row */}
      {types.length > 0 && (
        <div className="flex justify-center gap-2 mb-4">
          {types.map((typeObj) => {
            // Assign a color per type for visual appeal
            const typeColors = {
              normal: 'bg-gray-400', fire: 'bg-orange-500', water: 'bg-blue-500', grass: 'bg-green-500', electric: 'bg-yellow-400', ice: 'bg-cyan-300', fighting: 'bg-red-700', poison: 'bg-purple-500', ground: 'bg-yellow-700', flying: 'bg-indigo-300', psychic: 'bg-pink-400', bug: 'bg-lime-500', rock: 'bg-yellow-800', ghost: 'bg-indigo-700', dark: 'bg-gray-800', dragon: 'bg-purple-700', steel: 'bg-gray-500', fairy: 'bg-pink-300'
            };
            const color = typeColors[typeObj.type.name] || 'bg-gray-300';
            return (
              <span
                key={typeObj.type.name}
                className={`px-3 py-1 rounded-full text-white text-xs font-semibold shadow ${color} capitalize border border-black/10`}
                style={{ letterSpacing: '0.03em' }}
              >
                {typeObj.type.name}
              </span>
            );
          })}
        </div>
      )}
      {stats.map(s => (
  <div key={s.stat.name} className="mb-2">
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium">{formatStatName(s.stat.name)}</span>
      <span className="text-sm font-semibold">{s.base_stat}</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
      <div
        className={`${statColors[s.stat.name] || getStatColor(s.base_stat)} h-full rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${Math.min((s.base_stat / 255) * 100, 100)}%` }}
      />
    </div>
  </div>
))}
      
      {/* Total Stats Row */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-bold">Total</span>
          <span className="text-sm font-bold">{totalStats}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-purple-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min((totalStats / 600) * 100, 100)}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-gray-500 text-right">
        </div>
      </div>
    </div>
  );
}
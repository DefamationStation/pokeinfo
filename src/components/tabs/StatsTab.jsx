import React from 'react';
import { formatStatName, getStatColor } from '../../utils/stat';

export default function StatsTab({ stats }) {
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
    <div className="space-y-4 w-64 max-w-lg mx-auto">
      {stats.map(s => (
        <div key={s.stat.name} className="mb-3">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">{formatStatName(s.stat.name)}</span>
            <span className="text-sm font-semibold">{s.base_stat}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className={`${statColors[s.stat.name] || getStatColor(s.base_stat)} h-full rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${Math.min((s.base_stat / 255) * 100, 100)}%` }}
            />
          </div>
        </div>
      ))}
      
      {/* Total Stats Row */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-bold">Total</span>
          <span className="text-sm font-bold">{totalStats}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div
            className="bg-purple-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min((totalStats / 600) * 100, 100)}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500 text-right">
          Max: 600 (Typical Legendary)
        </div>
      </div>
    </div>
  );
}
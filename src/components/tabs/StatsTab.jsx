import React from 'react';
import { formatStatName, getStatColor } from '../../utils/stat';

export default function StatsTab({ stats }) {
  return (
    <div className="space-y-4">
      {stats.map(s => (
        <div key={s.stat.name} className="">
          <div className="flex justify-between mb-1">
            <span className="capitalize text-sm font-medium">{formatStatName(s.stat.name)}</span>
            <span className="text-sm">{s.base_stat}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`${getStatColor(s.base_stat)} h-full`}
              style={{ width: `${(s.base_stat / 255) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

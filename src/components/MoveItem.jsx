import React, { useState, useEffect, memo } from 'react';

const moveCache = {};

function MoveItem({ moveInfo }) {
  const [power, setPower] = useState(null);
  const moveName = moveInfo.move.name;
  const storageKey = 'move_' + moveName;

  // compute earliest level learned across version details
  const levels = moveInfo.version_group_details.map(d => d.level_learned_at);
  const levelLearnedAt = Math.min(...levels);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (moveCache[moveName] != null) {
      setPower(moveCache[moveName]);
    } else if (stored) {
      const val = JSON.parse(stored);
      moveCache[moveName] = val;
      setPower(val);
    } else {
      fetch(moveInfo.move.url)
        .then(res => res.json())
        .then(data => {
          moveCache[moveName] = data.power;
          localStorage.setItem(storageKey, JSON.stringify(data.power));
          setPower(data.power);
        });
    }
  }, [moveName, storageKey]);

  return (
    <div className="p-2 bg-gray-100 rounded flex justify-between items-center">
      <span className="capitalize">{moveName}</span>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">{levelLearnedAt > 0 ? `Lv ${levelLearnedAt}` : '—'}</span>
        <span className="text-sm text-gray-600">{power != null ? `${power} pow` : '...'}</span>
      </div>
    </div>
  );
}

export default memo(MoveItem);

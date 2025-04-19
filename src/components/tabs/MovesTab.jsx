import React from 'react';
import MoveItem from '../MoveItem';

export default function MovesTab({ moves }) {
  const sorted = moves.slice().sort((a, b) => {
    const aLvl = a.version_group_details[a.version_group_details.length - 1].level_learned_at;
    const bLvl = b.version_group_details[b.version_group_details.length - 1].level_learned_at;
    return aLvl - bLvl;
  });
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {sorted.map(moveInfo => (
        <MoveItem key={moveInfo.move.name} moveInfo={moveInfo} />
      ))}
    </div>
  );
}

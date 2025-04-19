import React from 'react';
import MoveItem from '../MoveItem';

export default function MovesTab({ moves }) {
  // Helper to get the most recent learn method and level
  function getLearnMethodAndLevel(move) {
    const details = move.version_group_details;
    const last = details[details.length - 1];
    return {
      method: last.move_learn_method.name,
      level: last.level_learned_at
    };
  }

  // Categorize and sort
  const levelUpMoves = [];
  const eggMoves = [];
  const machineMoves = [];
  const otherMoves = [];

  moves.forEach(move => {
    const { method, level } = getLearnMethodAndLevel(move);
    if (method === 'level-up') {
      levelUpMoves.push({ move, level });
    } else if (method === 'egg') {
      eggMoves.push(move);
    } else if (method === 'machine') {
      machineMoves.push(move);
    } else {
      otherMoves.push(move); // fallback for rare methods
    }
  });

  // Sort level-up moves by level ascending
  levelUpMoves.sort((a, b) => a.level - b.level);

  // Flatten sorted moves
  const sorted = [
    ...levelUpMoves.map(obj => obj.move),
    ...eggMoves,
    ...machineMoves,
    ...otherMoves
  ];

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {sorted.map(moveInfo => (
        <MoveItem key={moveInfo.move.name} moveInfo={moveInfo} />
      ))}
    </div>
  );
}

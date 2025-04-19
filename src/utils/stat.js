// Format stat name for display
export function formatStatName(stat) {
  return stat
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Get color class based on stat value
export function getStatColor(value) {
  if (value < 50) return 'bg-red-500';
  if (value < 80) return 'bg-yellow-500';
  if (value < 120) return 'bg-green-500';
  return 'bg-blue-500';
}

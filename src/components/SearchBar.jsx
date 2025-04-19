import React from 'react';

export default function SearchBar({ search, onSearchChange }) {
  return (
    <div className="my-4">
      <input
        type="text"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="Search Pokémon"
        className="w-full p-2 border rounded"
      />
    </div>
  );
}

import React, { useEffect, useRef, useCallback } from 'react';
import StatsTab from './tabs/StatsTab';
import DetailsTab from './tabs/DetailsTab';
import MovesTab from './tabs/MovesTab';

export default function PokemonModal({ details, loading, activeTab, onTabChange, onClose }) {
  const modalRef = useRef(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle overlay click with useCallback for better performance
  const handleOverlayClick = useCallback((e) => {
    // Only handle clicks (not mousedown) to avoid interference with other events
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  }, [onClose]);

  // Focus the modal when it opens
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-xl h-[750px] flex flex-col p-4 relative"
        onClick={e => e.stopPropagation()}
        tabIndex="-1" // Make it focusable
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>
        {loading ? (
          <p>Loading details…</p>
        ) : (
          <>
            <div className="text-center mb-4">
              <img
                src={details.sprites.other['official-artwork'].front_default}
                alt={details.name}
                className="mx-auto w-24 h-24"
              />
              <h2 className="text-2xl capitalize mt-2">{details.name}</h2>
            </div>

            <div className="flex justify-center space-x-4 mb-4">
  <button
    onClick={() => onTabChange('stats')}
    className={`px-4 py-2 ${activeTab === 'stats' ? 'border-b-2 border-blue-500' : ''}`}
  >
    Stats
  </button>
  <button
    onClick={() => onTabChange('moves')}
    className={`px-4 py-2 ${activeTab === 'moves' ? 'border-b-2 border-blue-500' : ''}`}
  >
    Moves
  </button>
  <button
    onClick={() => onTabChange('details')}
    className={`px-4 py-2 ${activeTab === 'details' ? 'border-b-2 border-blue-500' : ''}`}
  >
    Details
  </button>
</div>

            <div className="p-2 h-full overflow-y-auto">
  {activeTab === 'stats' && <StatsTab stats={details.stats} types={details.types} />}
  {activeTab === 'moves' && (
    <MovesTab
      moves={details.moves}
      pokemonName={details.name}
      pokemonImage={details.sprites.other['official-artwork'].front_default}
    />
  )}
  {activeTab === 'details' && <DetailsTab details={details} />}
</div>
          </>
        )}
      </div>
    </div>
  );
}
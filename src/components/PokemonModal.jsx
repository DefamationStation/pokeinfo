import React, { useEffect, useRef } from 'react';
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

  // Close on outside click
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onMouseDown={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-xl h-[48rem] overflow-y-auto p-4 relative"
        onMouseDown={e => e.stopPropagation()}
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
                className="mx-auto w-32 h-32"
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
                onClick={() => onTabChange('details')}
                className={`px-4 py-2 ${activeTab === 'details' ? 'border-b-2 border-blue-500' : ''}`}
              >
                Details
              </button>
              <button
                onClick={() => onTabChange('moves')}
                className={`px-4 py-2 ${activeTab === 'moves' ? 'border-b-2 border-blue-500' : ''}`}
              >
                Moves
              </button>
            </div>

            <div className="p-2">
              {activeTab === 'stats' && <StatsTab stats={details.stats} />}
              {activeTab === 'details' && <DetailsTab details={details} />}
              {activeTab === 'moves' && <MovesTab moves={details.moves} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

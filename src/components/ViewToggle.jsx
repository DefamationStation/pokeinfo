import React, { memo } from 'react';

const ViewToggle = ({ currentView, onViewChange }) => {
  return (
    <div className="flex items-center justify-center mb-4">
      <span className="mr-2 text-sm text-gray-600">View:</span>
      <div className="flex bg-gray-200 rounded-lg p-1">
        <button
          onClick={() => onViewChange('grid')}
          className={`py-1 px-3 rounded-md text-sm ${
            currentView === 'grid'
              ? 'bg-white text-gray-800 shadow'
              : 'text-gray-600 hover:bg-gray-300'
          }`}
        >
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Cards
          </div>
        </button>
        <button
          onClick={() => onViewChange('table')}
          className={`py-1 px-3 rounded-md text-sm ${
            currentView === 'table'
              ? 'bg-white text-gray-800 shadow'
              : 'text-gray-600 hover:bg-gray-300'
          }`}
        >
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            Table
          </div>
        </button>
      </div>
    </div>
  );
};

export default memo(ViewToggle);
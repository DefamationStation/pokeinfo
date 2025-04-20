import React from 'react';

export default function CacheProgressBar({ isActive, progress, total, currentTask }) {
  const percent = total > 0 ? Math.floor((progress / total) * 100) : 0;
  // Always reserve space: height matches the active bar
  // Only fade out when complete
  const isComplete = progress === total && !isActive && total > 0;
  return (
    <div className="w-full sticky top-0 z-50" style={{ minHeight: '56px', transition: 'min-height 0.3s' }}>
      <div
        className={
          `bg-blue-100 border-b border-blue-200 py-2 px-4 flex items-center justify-between w-full h-full transition-opacity duration-500 ${isComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'}`
        }
        style={{ position: 'absolute', left: 0, right: 0 }}
        aria-hidden={isComplete}
      >
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-medium text-blue-700 text-sm">{currentTask}</span>
        </div>
        <div className="flex-1 mx-4">
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <div className="text-xs text-blue-700 mt-1 text-right">{progress} / {total} ({percent}%)</div>
        </div>
      </div>
    </div>
  );
}


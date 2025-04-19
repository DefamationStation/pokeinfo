import React, { useState, useEffect, memo } from 'react';

const moveCache = {};

function MoveItem({ moveInfo }) {
  const [expanded, setExpanded] = useState(false);
  const [moveDetails, setMoveDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const moveName = moveInfo.move.name;
  const storageKey = 'move_' + moveName;

  // Format move name for display
  const formattedName = moveName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Compute earliest level learned across version details
  const levels = moveInfo.version_group_details
    .filter(d => d.level_learned_at > 0)
    .map(d => d.level_learned_at);
  
  const levelLearnedAt = levels.length > 0 ? Math.min(...levels) : 0;
  
  // Get the learn method from the most recent version group detail
  const learnMethod = moveInfo.version_group_details.length > 0 
    ? moveInfo.version_group_details[moveInfo.version_group_details.length - 1].move_learn_method?.name 
    : 'level-up';

  const toggleExpand = () => {
    setExpanded(!expanded);
    if (!moveDetails && !loading) {
      fetchMoveDetails();
    }
  };

  // Fetch move details immediately on component mount
  useEffect(() => {
    if (!moveDetails) {
      fetchMoveDetails(false); // don't show loading indicator on initial load
    }
  }, []);

  const fetchMoveDetails = (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    // Check cache first
    if (moveCache[moveName]) {
      setMoveDetails(moveCache[moveName]);
      setLoading(false);
      return;
    }
    
    // Then check localStorage
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          moveCache[moveName] = parsed;
          setMoveDetails(parsed);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Error parsing stored move data:", e);
      // Continue to fetch from API
    }
    
    // Fetch from API if not in cache or localStorage
    fetch(moveInfo.move.url)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch move data for ${moveName}`);
        return res.json();
      })
      .then(data => {
        // Validate the data
        if (!data || typeof data !== 'object') {
          throw new Error(`Invalid data received for ${moveName}`);
        }
        
        moveCache[moveName] = data;
        
        try {
          localStorage.setItem(storageKey, JSON.stringify(data));
        } catch (e) {
          console.warn("Could not save to localStorage:", e);
        }
        
        setMoveDetails(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching move details:", err);
        setLoading(false);
      });
  };

  // Function to determine badge color based on move type
  const getTypeColor = (type) => {
    const typeColors = {
      normal: 'bg-gray-400 text-white',
      fire: 'bg-red-600 text-white',
      water: 'bg-blue-500 text-white',
      electric: 'bg-yellow-500 text-white',
      grass: 'bg-green-500 text-white',
      ice: 'bg-blue-300 text-white',
      fighting: 'bg-orange-600 text-white',
      poison: 'bg-purple-600 text-white',
      ground: 'bg-yellow-600 text-white',
      flying: 'bg-indigo-400 text-white',
      psychic: 'bg-pink-500 text-white',
      bug: 'bg-green-600 text-white',
      rock: 'bg-yellow-700 text-white',
      ghost: 'bg-indigo-700 text-white',
      dragon: 'bg-purple-700 text-white',
      dark: 'bg-gray-800 text-white',
      steel: 'bg-gray-500 text-white',
      fairy: 'bg-pink-400 text-white',
      default: 'bg-gray-400 text-white'
    };
    
    return typeColors[type] || typeColors.default;
  };

  // Get the learn method badge
  const getLearnMethodBadge = () => {
    if (levelLearnedAt > 0) {
      return (
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          Lv {levelLearnedAt}
        </span>
      );
    } else if (learnMethod === 'machine') {
      return (
        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
          TM/HM
        </span>
      );
    } else if (learnMethod === 'egg') {
      return (
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
          Egg
        </span>
      );
    } else if (learnMethod === 'tutor') {
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
          Tutor
        </span>
      );
    }
    
    return null;
  };

  // Find the most recent English flavor text
  const getDescription = (flavorTexts) => {
    if (!flavorTexts || !Array.isArray(flavorTexts) || flavorTexts.length === 0) {
      return "No description available.";
    }
    
    // Filter texts that have proper language property and are in English
    const englishTexts = flavorTexts.filter(text => 
      text && text.language && text.language.name === 'en' && text.flavor_text
    );
    
    if (englishTexts.length === 0) {
      return "No English description available.";
    }
    
    // Get the most recent text entry
    try {
      const sortedTexts = englishTexts.sort((a, b) => {
        if (!a.version_group || !b.version_group) return 0;
        const versionA = a.version_group.name;
        const versionB = b.version_group.name;
        return versionB.localeCompare(versionA);
      });
      
      return sortedTexts[0].flavor_text.replace(/\f/g, ' ');
    } catch (error) {
      console.error("Error processing flavor text:", error);
      return englishTexts[0].flavor_text.replace(/\f/g, ' ');
    }
  };

  return (
    <div className="mb-3">
      <div 
        className={`p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition cursor-pointer ${expanded ? 'rounded-b-none' : ''}`}
        onClick={toggleExpand}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="font-medium">{formattedName}</span>
            {moveDetails && moveDetails.type && (
              <span className={`ml-2.5 px-2 py-0.5 text-xs rounded-full ${getTypeColor(moveDetails.type.name)}`}>
                {moveDetails.type.name.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {getLearnMethodBadge()}
            {moveDetails && typeof moveDetails.power === 'number' && (
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                {moveDetails.power} PWR
              </span>
            )}
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? 'transform rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 bg-white border border-gray-200 rounded-b-lg shadow-inner">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="border-2 border-gray-200 border-t-red-500 rounded-full w-6 h-6 animate-spin"></div>
            </div>
          ) : moveDetails ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-100 p-2 rounded">
                  <span className="text-xs text-gray-500">Type</span>
                  <p className="capitalize">{moveDetails.type ? moveDetails.type.name : "—"}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <span className="text-xs text-gray-500">Category</span>
                  <p className="capitalize">{moveDetails.damage_class ? moveDetails.damage_class.name : "—"}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <span className="text-xs text-gray-500">Power</span>
                  <p>{typeof moveDetails.power === 'number' ? moveDetails.power : "—"}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <span className="text-xs text-gray-500">Accuracy</span>
                  <p>{typeof moveDetails.accuracy === 'number' ? `${moveDetails.accuracy}%` : "—"}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <span className="text-xs text-gray-500">PP</span>
                  <p>{typeof moveDetails.pp === 'number' ? moveDetails.pp : "—"}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <span className="text-xs text-gray-500">Priority</span>
                  <p>{typeof moveDetails.priority === 'number' ? moveDetails.priority : "0"}</p>
                </div>
              </div>
              
              <div className="mt-3">
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {getDescription(moveDetails.flavor_text_entries)}
                </p>
              </div>
              
              {moveDetails.effect_entries && moveDetails.effect_entries.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Effect</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {moveDetails.effect_entries.find(entry => entry.language && entry.language.name === 'en')?.effect || 
                     moveDetails.effect_entries[0]?.effect || "No effect information available."}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-2">Failed to load move details</p>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(MoveItem);
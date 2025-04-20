import React from 'react';
import { calculateBestTypes } from '../utils/typeCalculations';
import typeColors from '../constants/typeColors';

/**
 * Component that displays type recommendations based on Pokemon's original types and selected Tera type
 * 
 * @param {Array} types - Original Pokemon type objects
 * @param {String} teraType - Selected Tera type
 */
export default function TypeRecommendation({ types, teraType }) {
  // Get type recommendations
  const recommendations = calculateBestTypes(types, teraType);
  
  // Function to get type badge color
  const getTypeColor = (type) => {
    return typeColors[type] || typeColors.normal;
  };
  
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="text-sm font-semibold border-b border-blue-200 pb-1 mb-3">
        Best Types Against This Setup
      </h3>
      
      {/* Best Single Type */}
      <div className="mb-3">
        <span className="text-xs text-blue-700 font-medium">Best Single Type:</span>
        <div className="flex mt-1">
          {recommendations.bestSingleType ? (
            <span 
              className={`px-3 py-1 rounded-full text-xs capitalize font-semibold ${getTypeColor(recommendations.bestSingleType)}`}
            >
              {recommendations.bestSingleType}
            </span>
          ) : (
            <span className="text-xs text-gray-500">No ideal single type found</span>
          )}
        </div>
      </div>
      
      {/* Alternative Single Types */}
      {recommendations.alternativeSingleTypes && recommendations.alternativeSingleTypes.length > 0 && (
        <div className="mb-3">
          <span className="text-xs text-blue-700 font-medium">Alternatives:</span>
          <div className="flex gap-1 mt-1">
            {recommendations.alternativeSingleTypes.map((type, idx) => (
              <span 
                key={idx}
                className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(type)}`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Best Dual Types */}
      <div>
        <span className="text-xs text-blue-700 font-medium">Best Dual Types:</span>
        <div className="flex flex-col gap-2 mt-1">
          {recommendations.bestDualTypes.length > 0 ? (
            recommendations.bestDualTypes.slice(0, 3).map((typePair, idx) => (
              <div key={idx} className="flex gap-1 items-center">
                <span 
                  className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(typePair[0])}`}
                >
                  {typePair[0]}
                </span>
                <span className="text-xs">/</span>
                <span 
                  className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(typePair[1])}`}
                >
                  {typePair[1]}
                </span>
              </div>
            ))
          ) : (
            <span className="text-xs text-gray-500">No ideal dual types found</span>
          )}
        </div>
      </div>
    </div>
  );
}
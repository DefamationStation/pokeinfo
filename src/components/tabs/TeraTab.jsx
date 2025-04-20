import React, { useState, useMemo } from 'react';
import typeColors from '../../constants/typeColors';
import TypeRecommendation from '../TypeRecommendation';
import { typeEffectiveness, typeOffensive, calculateCombinedOffensive } from '../../utils/typeCalculations';

export default function TeraTab({ types = [] }) {
  const [selectedTeraType, setSelectedTeraType] = useState('normal');
  
  // Select current effectiveness based on selected Tera type
  const currentEffectiveness = typeEffectiveness[selectedTeraType] || typeEffectiveness.normal;
  
  // Calculate offensive effectiveness for the Pokemon's original types
  const originalTypeOffensive = useMemo(() => {
    return calculateCombinedOffensive(types);
  }, [types]);
  
  // Function to get type badge color
  const getTypeColor = (type) => {
    return typeColors[type] || typeColors.normal;
  };
  
  // Format type name for header display
  const formatTypeName = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  // Get original type names as formatted string for display
  const originalTypeNames = types.map(t => formatTypeName(t.type.name)).join('/');
  
  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      {/* Tera Type Selection */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">Select Tera Type</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {Object.keys(typeEffectiveness).map(type => (
            <button
              key={type}
              onClick={() => setSelectedTeraType(type)}
              className={`px-2 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                selectedTeraType === type 
                  ? `${getTypeColor(type)} ring-2 ring-offset-2 ring-blue-500` 
                  : `${getTypeColor(type)} opacity-70 hover:opacity-100`
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      {/* Current Pokemon Types & Tera Type + Recommendations - Side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Left Side: Pokemon & Tera Type */}
        <div className="bg-gray-50 p-4 rounded-lg text-left">
          <div className="flex gap-2 mb-2">
            {types.map((typeObj) => (
              <span
                key={typeObj.type.name}
                className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(typeObj.type.name)}`}
              >
                {typeObj.type.name}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Terastallized as:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm capitalize font-semibold ${getTypeColor(selectedTeraType)}`}
            >
              {selectedTeraType}
            </span>
          </div>
        </div>
        
        {/* Right Side: Type Recommendations */}
        <TypeRecommendation types={types} teraType={selectedTeraType} />
      </div>
      
      {/* Type Effectiveness Sections - Split into two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT COLUMN: Defensive (what's effective against selected Tera type) */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold border-b pb-1 mb-2">
            {formatTypeName(selectedTeraType)} Tera Type Weaknesses
          </h3>
          
          {/* Super Effective (x2) */}
          <div className="bg-red-50 border border-red-100 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-red-800 mb-2">Super Effective (x2)</h4>
            <div className="flex flex-wrap gap-1">
              {currentEffectiveness.superEffective.length > 0 ? (
                currentEffectiveness.superEffective.map(type => (
                  <span
                    key={type}
                    className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(type)}`}
                  >
                    {type}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">No types are super effective</span>
              )}
            </div>
          </div>
          
          {/* Not Very Effective (x0.5) */}
          <div className="bg-green-50 border border-green-100 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-green-800 mb-2">Not Very Effective (x0.5)</h4>
            <div className="flex flex-wrap gap-1">
              {currentEffectiveness.notVeryEffective.length > 0 ? (
                currentEffectiveness.notVeryEffective.map(type => (
                  <span
                    key={type}
                    className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(type)}`}
                  >
                    {type}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">No types are resisted</span>
              )}
            </div>
          </div>
          
          {/* No Effect (x0) */}
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-purple-800 mb-2">No Effect (x0)</h4>
            <div className="flex flex-wrap gap-1">
              {currentEffectiveness.noEffect.length > 0 ? (
                currentEffectiveness.noEffect.map(type => (
                  <span
                    key={type}
                    className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(type)}`}
                  >
                    {type}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">No types are completely ineffective</span>
              )}
            </div>
          </div>
        </div>
        
        {/* RIGHT COLUMN: Offensive (what the Pokemon's original types are strong against) */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold border-b pb-1 mb-2">
            Original Type {originalTypeNames}
          </h3>
          
          {/* Super Effective (x2) */}
          <div className="bg-red-50 border border-red-100 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-red-800 mb-2">Strong Against (x2)</h4>
            <div className="flex flex-wrap gap-1">
              {originalTypeOffensive.superEffective.length > 0 ? (
                originalTypeOffensive.superEffective.map(type => (
                  <span
                    key={type}
                    className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(type)}`}
                  >
                    {type}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">Not strong against any types</span>
              )}
            </div>
          </div>
          
          {/* Not Very Effective (x0.5) */}
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">Not Very Effective (x0.5)</h4>
            <div className="flex flex-wrap gap-1">
              {originalTypeOffensive.notVeryEffective.length > 0 ? (
                originalTypeOffensive.notVeryEffective.map(type => (
                  <span
                    key={type}
                    className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(type)}`}
                  >
                    {type}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">No weakened effectiveness</span>
              )}
            </div>
          </div>
          
          {/* No Effect (x0) */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">No Effect (x0)</h4>
            <div className="flex flex-wrap gap-1">
              {originalTypeOffensive.noEffect.length > 0 ? (
                originalTypeOffensive.noEffect.map(type => (
                  <span
                    key={type}
                    className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(type)}`}
                  >
                    {type}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">All types receive some damage</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
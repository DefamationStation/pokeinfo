import React from 'react';

export default function DetailsTab({ details }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="text-sm text-gray-500">Height</h3>
        <p>{(details.height / 10).toFixed(1)} m</p>
      </div>
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="text-sm text-gray-500">Weight</h3>
        <p>{(details.weight / 10).toFixed(1)} kg</p>
      </div>
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="text-sm text-gray-500">Base Experience</h3>
        <p>{details.base_experience}</p>
      </div>
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="text-sm text-gray-500">Order</h3>
        <p>{details.order}</p>
      </div>
      <div className="col-span-full">
        <h3 className="text-lg font-semibold mt-6 mb-3">Held Items</h3>
        {details.held_items && details.held_items.length > 0 ? (
          <div className="space-y-2">
            {details.held_items.map(heldItemInfo => {
              const formattedName = heldItemInfo.item.name
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

              return (
                <div key={heldItemInfo.item.name} className="bg-gray-100 p-3 rounded flex justify-between">
                  <span>{formattedName}</span>
                  <span className="text-sm text-gray-600">
                    {heldItemInfo.version_details[0]?.rarity}% chance
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No held items</p>
        )}
      </div>
    </div>
  );
}

import React from 'react';

const cardData = [
  { title: 'Earthquakes', value: 'Today', color: 'bg-purple-600', icon: '🌍' },
  { title: 'Flood', value: 'Zones', color: 'bg-blue-600', icon: '💧' },
  { title: 'Regions Affected', value: '', color: 'bg-red-600', icon: '🔥' },
];

const TopCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      {cardData.map((card, index) => (
        <div
          key={index}
          className={`p-4 rounded-xl shadow-md text-white flex items-center justify-between ${card.color}`}
        >
          <div>
            <h2 className="text-lg font-bold">{card.title}</h2>
            <p className="text-sm">{card.value}</p>
          </div>
          <div className="text-2xl">{card.icon}</div>
        </div>
      ))}
    </div>
  );
};

export default TopCards;

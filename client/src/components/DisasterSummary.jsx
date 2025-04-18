import React from 'react';
import { useDisasters } from '../contexts/DisasterContext';

const DisasterSummary = () => {
  const { disasters, getDisasterCountByType } = useDisasters();
  const counts = getDisasterCountByType();

  // Calculate severity distribution
  const severityCounts = {
    low: 0,    // 1-3
    medium: 0, // 4-6
    high: 0,   // 7-10
  };

  disasters.forEach(disaster => {
    if (disaster.severity >= 1 && disaster.severity <= 3) {
      severityCounts.low++;
    } else if (disaster.severity >= 4 && disaster.severity <= 6) {
      severityCounts.medium++;
    } else {
      severityCounts.high++;
    }
  });

  // Calculate status distribution
  const statusCounts = {
    DETECTED: 0,
    MONITORING: 0,
    RESPONDING: 0,
    CONTAINED: 0,
    RESOLVED: 0,
  };

  disasters.forEach(disaster => {
    statusCounts[disaster.status]++;
  });

  const cards = [
    {
      title: 'Total Disasters',
      value: counts.TOTAL,
      color: 'bg-blue-500',
      icon: '📊',
    },
    {
      title: 'Earthquakes',
      value: counts.EARTHQUAKE,
      color: 'bg-red-500',
      icon: '🔴',
    },
    {
      title: 'Floods',
      value: counts.FLOOD,
      color: 'bg-blue-500',
      icon: '🌊',
    },
    {
      title: 'Fires',
      value: counts.FIRE,
      color: 'bg-orange-500',
      icon: '🔥',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center">
            <div className={`${card.color} rounded-full p-3 text-white mr-4`}>
              <span className="text-xl">{card.icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{card.title}</h3>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Severity Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow md:col-span-2">
        <h3 className="text-lg font-semibold mb-3">Severity Distribution</h3>
        <div className="flex">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm">Low (1-3)</span>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-sm">Medium (4-6)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm">High (7-10)</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative pt-1">
              <div className="flex h-6 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="bg-green-500"
                  style={{ width: `${(severityCounts.low / counts.TOTAL) * 100 || 0}%` }}
                ></div>
                <div
                  className="bg-yellow-500"
                  style={{ width: `${(severityCounts.medium / counts.TOTAL) * 100 || 0}%` }}
                ></div>
                <div
                  className="bg-red-500"
                  style={{ width: `${(severityCounts.high / counts.TOTAL) * 100 || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>{severityCounts.low} events</span>
              <span>{severityCounts.medium} events</span>
              <span>{severityCounts.high} events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow md:col-span-2">
        <h3 className="text-lg font-semibold mb-3">Response Status</h3>
        <div className="space-y-3">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status}>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{status}</span>
                <span className="text-sm font-semibold">{count}</span>
              </div>
              <div className="relative pt-1">
                <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`${
                      status === 'DETECTED' ? 'bg-red-500' :
                      status === 'MONITORING' ? 'bg-orange-500' :
                      status === 'RESPONDING' ? 'bg-yellow-500' :
                      status === 'CONTAINED' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(count / counts.TOTAL) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisasterSummary; 
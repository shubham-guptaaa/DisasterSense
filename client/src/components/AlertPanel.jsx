import React from 'react';
import { useAlerts } from '../contexts/AlertContext';

const severityColors = {
  1: 'bg-green-100 border-green-500 text-green-800',
  2: 'bg-green-100 border-green-500 text-green-800',
  3: 'bg-green-100 border-green-500 text-green-800',
  4: 'bg-yellow-100 border-yellow-500 text-yellow-800',
  5: 'bg-yellow-100 border-yellow-500 text-yellow-800',
  6: 'bg-yellow-100 border-yellow-500 text-yellow-800',
  7: 'bg-orange-100 border-orange-500 text-orange-800',
  8: 'bg-orange-100 border-orange-500 text-orange-800',
  9: 'bg-red-100 border-red-500 text-red-800',
  10: 'bg-red-100 border-red-500 text-red-800',
};

const disasterIcons = {
  EARTHQUAKE: '🔴',
  FLOOD: '🌊',
  FIRE: '🔥',
  STORM: '⚡',
  OTHER: '⚠️',
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const AlertPanel = () => {
  const { activeAlerts, clearAlert, clearAllAlerts } = useAlerts();

  if (activeAlerts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Active Alerts</h2>
        </div>
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          <p>No active alerts at this time.</p>
          <p className="text-sm mt-2">
            Alerts will appear here when disasters are detected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Active Alerts</h2>
        {activeAlerts.length > 0 && (
          <button
            onClick={clearAllAlerts}
            className="text-sm px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activeAlerts.map((alert) => (
          <div
            key={alert.disasterId}
            className={`border-l-4 p-3 rounded-r ${
              severityColors[alert.severity] || 'bg-gray-100 border-gray-500'
            } dark:bg-opacity-20 relative`}
          >
            <button
              onClick={() => clearAlert(alert.disasterId)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>

            <div className="flex items-start">
              <div className="text-2xl mr-3">
                {disasterIcons[alert.disasterType] || '⚠️'}
              </div>
              <div className="flex-1">
                <div className="font-semibold">
                  {alert.disasterType} Alert - Severity {alert.severity}/10
                </div>
                <p className="text-sm mt-1">{alert.description}</p>
                <div className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                  Location: {alert.location?.coordinates?.[1]?.toFixed(4)},{' '}
                  {alert.location?.coordinates?.[0]?.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Detected: {formatDate(alert.timestamp)}
                </div>
              </div>
            </div>

            <div className="mt-2 flex justify-end">
              <button className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200 mr-2">
                View on Map
              </button>
              <button className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertPanel; 
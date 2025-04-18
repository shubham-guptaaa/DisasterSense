import React from 'react';
import SimulationPanel from '../components/SimulationPanel';

const SimulationPage = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Disaster Simulation</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Use this tool to simulate disaster events for testing purposes. The simulated events will appear in real-time on the dashboard and map.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SimulationPanel />
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Simulation Guide</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-blue-600 dark:text-blue-400">Earthquake Simulation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <strong>Magnitude:</strong> Richter scale value, typically 0-10. Values above 4.0 will trigger a disaster alert.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <strong>Depth:</strong> Depth in kilometers. Shallower earthquakes (smaller values) are typically more damaging.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-600 dark:text-blue-400">Flood Simulation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <strong>Water Level:</strong> Height in meters. Values above 3.0m will trigger a disaster alert.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <strong>Flow Rate:</strong> Cubic meters per second, indicates how quickly water is flowing.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-600 dark:text-blue-400">Fire Simulation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <strong>Temperature:</strong> Temperature in Celsius. Values above 60°C will trigger a disaster alert.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <strong>Smoke Level:</strong> Air Quality Index (AQI) value, typically 0-500. Higher values indicate more dangerous air quality.
              </p>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold">Tips for Testing</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 mt-1 space-y-1">
                <li>Use the 📍 button to get your current location</li>
                <li>Try different severity levels to see how the system responds</li>
                <li>Test multiple disasters in the same area to see clustering</li>
                <li>Check the Dashboard and Map views after creating a simulation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPage; 
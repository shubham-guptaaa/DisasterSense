import React, { useState } from 'react';
import { simulationService } from '../services/api';

const SimulationPanel = () => {
  // Common state for all simulation types
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [simulationType, setSimulationType] = useState('earthquake');
  
  // Earthquake specific state
  const [magnitude, setMagnitude] = useState('');
  const [depth, setDepth] = useState('10');
  
  // Flood specific state
  const [waterLevel, setWaterLevel] = useState('');
  const [flowRate, setFlowRate] = useState('0');
  
  // Fire specific state
  const [temperature, setTemperature] = useState('');
  const [smokeLevel, setSmokeLevel] = useState('0');

  // Reset form
  const resetForm = () => {
    setLongitude('');
    setLatitude('');
    setLocation('');
    setMagnitude('');
    setDepth('10');
    setWaterLevel('');
    setFlowRate('0');
    setTemperature('');
    setSmokeLevel('0');
    setResult(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      let response;
      
      // Common payload
      const commonPayload = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        location: location || 'Simulated location',
      };
      
      // Send request based on simulation type
      switch (simulationType) {
        case 'earthquake':
          response = await simulationService.simulateEarthquake({
            ...commonPayload,
            magnitude: parseFloat(magnitude),
            depth: parseFloat(depth),
          });
          break;
          
        case 'flood':
          response = await simulationService.simulateFlood({
            ...commonPayload,
            waterLevel: parseFloat(waterLevel),
            flowRate: parseFloat(flowRate),
          });
          break;
          
        case 'fire':
          response = await simulationService.simulateFire({
            ...commonPayload,
            temperature: parseFloat(temperature),
            smokeLevel: parseFloat(smokeLevel),
          });
          break;
          
        default:
          throw new Error('Invalid simulation type');
      }
      
      setResult({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Error simulating disaster:', error);
      setResult({
        success: false,
        error: error.message || 'An error occurred during simulation'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your location. Please enter it manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Simulate Disaster</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Disaster Type</label>
        <div className="flex space-x-4">
          <button
            type="button"
            className={`px-4 py-2 rounded ${
              simulationType === 'earthquake'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
            onClick={() => setSimulationType('earthquake')}
          >
            Earthquake
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded ${
              simulationType === 'flood'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
            onClick={() => setSimulationType('flood')}
          >
            Flood
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded ${
              simulationType === 'fire'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
            onClick={() => setSimulationType('fire')}
          >
            Fire
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1">Latitude</label>
            <div className="flex">
              <input
                type="number"
                step="any"
                className="w-full px-3 py-2 border rounded-l dark:bg-gray-700 dark:border-gray-600"
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
              />
              <button
                type="button"
                className="bg-gray-200 dark:bg-gray-600 px-3 py-2 rounded-r"
                onClick={getCurrentLocation}
              >
                📍
              </button>
            </div>
          </div>
          
          <div>
            <label className="block mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="Longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block mb-1">Location Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g., Downtown, City Center"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          
          {/* Earthquake specific fields */}
          {simulationType === 'earthquake' && (
            <>
              <div>
                <label className="block mb-1">Magnitude (Richter)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="e.g., 5.5"
                  value={magnitude}
                  onChange={(e) => setMagnitude(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1">Depth (km)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="e.g., 10"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                />
              </div>
            </>
          )}
          
          {/* Flood specific fields */}
          {simulationType === 'flood' && (
            <>
              <div>
                <label className="block mb-1">Water Level (m)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="e.g., 2.5"
                  value={waterLevel}
                  onChange={(e) => setWaterLevel(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1">Flow Rate (m³/s)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="e.g., 500"
                  value={flowRate}
                  onChange={(e) => setFlowRate(e.target.value)}
                />
              </div>
            </>
          )}
          
          {/* Fire specific fields */}
          {simulationType === 'fire' && (
            <>
              <div>
                <label className="block mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="e.g., 65"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1">Smoke Level (AQI)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="e.g., 150"
                  value={smokeLevel}
                  onChange={(e) => setSmokeLevel(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Simulating...' : 'Simulate Disaster'}
          </button>
          
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded"
            onClick={resetForm}
          >
            Reset
          </button>
        </div>
      </form>
      
      {/* Display result */}
      {result && (
        <div className={`mt-4 p-4 rounded ${
          result.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
        }`}>
          <h3 className="font-semibold mb-2">
            {result.success ? 'Simulation Result' : 'Simulation Error'}
          </h3>
          <pre className="whitespace-pre-wrap overflow-auto text-sm">
            {JSON.stringify(result.data || result.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SimulationPanel; 
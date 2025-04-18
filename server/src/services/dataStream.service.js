import { io } from '../app.js';
import DisasterEvent from '../models/DisasterEvent.js';
import { processDisasterAlert } from '../controllers/alert.controller.js';

/**
 * Service to handle real-time data processing from Fluvio or other data sources.
 * In a real implementation, this would be connected to Fluvio streams.
 */
class DataStreamService {
  constructor() {
    this.sensorThresholds = {
      EARTHQUAKE: {
        magnitude: 4.0, // Richter scale
        depth: 10, // km
      },
      FLOOD: {
        waterLevel: 3.0, // meters
        flowRate: 500, // cubic meters per second
      },
      FIRE: {
        temperature: 60, // Celsius
        smokeLevel: 150, // AQI
      },
      STORM: {
        windSpeed: 65, // km/h
        precipitation: 25, // mm/h
      },
    };
  }

  /**
   * Initialize data stream handlers
   */
  init() {
    console.log('Data stream service initialized');
    
    // In a real implementation, this would set up Fluvio consumers
    // For simulation, we can add a method to manually trigger events
  }

  /**
   * Process incoming earthquake sensor data
   * @param {Object} data - Earthquake sensor data
   */
  async processEarthquakeData(data) {
    try {
      const { magnitude, depth, latitude, longitude, location, sensorId } = data;
      
      // Check if this exceeds our threshold for creating a disaster event
      if (magnitude >= this.sensorThresholds.EARTHQUAKE.magnitude) {
        // Calculate severity on scale of 1-10
        const severity = Math.min(10, Math.ceil(magnitude));
        
        // Create a new disaster event
        const disaster = await DisasterEvent.create({
          type: 'EARTHQUAKE',
          location: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          severity,
          description: `Earthquake of magnitude ${magnitude} detected at ${location}`,
          readings: [
            {
              sensorId,
              value: magnitude,
              timestamp: new Date(),
            },
          ],
          status: 'DETECTED',
        });
        
        // Emit to all connected clients
        io.to('EARTHQUAKE').emit('new-disaster', disaster);
        io.to('ALL').emit('new-disaster', disaster);
        
        // Process alerts for this disaster
        await processDisasterAlert(disaster._id);
        
        return disaster;
      }
      
      return null;
    } catch (error) {
      console.error('Error processing earthquake data:', error);
      throw error;
    }
  }

  /**
   * Process incoming flood sensor data
   * @param {Object} data - Flood sensor data
   */
  async processFloodData(data) {
    try {
      const { waterLevel, flowRate, latitude, longitude, location, sensorId } = data;
      
      // Check if this exceeds our threshold for creating a disaster event
      if (waterLevel >= this.sensorThresholds.FLOOD.waterLevel) {
        // Calculate severity on scale of 1-10
        const severity = Math.min(10, Math.ceil(waterLevel * 2));
        
        // Create a new disaster event
        const disaster = await DisasterEvent.create({
          type: 'FLOOD',
          location: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          severity,
          description: `Flood with water level ${waterLevel}m detected at ${location}`,
          readings: [
            {
              sensorId,
              value: waterLevel,
              timestamp: new Date(),
            },
          ],
          status: 'DETECTED',
        });
        
        // Emit to all connected clients
        io.to('FLOOD').emit('new-disaster', disaster);
        io.to('ALL').emit('new-disaster', disaster);
        
        // Process alerts for this disaster
        await processDisasterAlert(disaster._id);
        
        return disaster;
      }
      
      return null;
    } catch (error) {
      console.error('Error processing flood data:', error);
      throw error;
    }
  }

  /**
   * Process incoming fire sensor data
   * @param {Object} data - Fire sensor data
   */
  async processFireData(data) {
    try {
      const { temperature, smokeLevel, latitude, longitude, location, sensorId } = data;
      
      // Check if this exceeds our threshold for creating a disaster event
      if (temperature >= this.sensorThresholds.FIRE.temperature) {
        // Calculate severity on scale of 1-10
        const severity = Math.min(10, Math.ceil((temperature - 40) / 10));
        
        // Create a new disaster event
        const disaster = await DisasterEvent.create({
          type: 'FIRE',
          location: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          severity,
          description: `Fire with temperature ${temperature}°C detected at ${location}`,
          readings: [
            {
              sensorId,
              value: temperature,
              timestamp: new Date(),
            },
          ],
          status: 'DETECTED',
        });
        
        // Emit to all connected clients
        io.to('FIRE').emit('new-disaster', disaster);
        io.to('ALL').emit('new-disaster', disaster);
        
        // Process alerts for this disaster
        await processDisasterAlert(disaster._id);
        
        return disaster;
      }
      
      return null;
    } catch (error) {
      console.error('Error processing fire data:', error);
      throw error;
    }
  }

  /**
   * Simulate receiving sensor data for testing
   * @param {String} type - Type of disaster
   * @param {Object} data - Simulated sensor data
   */
  async simulateSensorData(type, data) {
    switch (type.toUpperCase()) {
      case 'EARTHQUAKE':
        return await this.processEarthquakeData(data);
      case 'FLOOD':
        return await this.processFloodData(data);
      case 'FIRE':
        return await this.processFireData(data);
      default:
        console.warn(`Unknown disaster type: ${type}`);
        return null;
    }
  }
}

// Export singleton instance
export default new DataStreamService(); 
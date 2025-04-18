import express from 'express';
import dataStreamService from '../services/dataStream.service.js';

const router = express.Router();

/**
 * @route   POST /api/simulate/earthquake
 * @desc    Simulate earthquake sensor data
 * @access  Public (would be restricted in production)
 */
router.post('/earthquake', async (req, res) => {
  try {
    const {
      magnitude,
      depth = 10,
      latitude,
      longitude,
      location = 'Unknown location',
      sensorId = 'SIM-EARTHQUAKE-1',
    } = req.body;
    
    if (!magnitude || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Please provide magnitude, latitude, and longitude',
      });
    }
    
    const result = await dataStreamService.simulateSensorData('EARTHQUAKE', {
      magnitude: parseFloat(magnitude),
      depth: parseFloat(depth),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      location,
      sensorId,
    });
    
    if (result) {
      res.status(201).json({
        success: true,
        message: 'Earthquake simulation processed successfully',
        data: result,
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'Simulation processed but no disaster was created (below threshold)',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
});

/**
 * @route   POST /api/simulate/flood
 * @desc    Simulate flood sensor data
 * @access  Public (would be restricted in production)
 */
router.post('/flood', async (req, res) => {
  try {
    const {
      waterLevel,
      flowRate = 0,
      latitude,
      longitude,
      location = 'Unknown location',
      sensorId = 'SIM-FLOOD-1',
    } = req.body;
    
    if (!waterLevel || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Please provide waterLevel, latitude, and longitude',
      });
    }
    
    const result = await dataStreamService.simulateSensorData('FLOOD', {
      waterLevel: parseFloat(waterLevel),
      flowRate: parseFloat(flowRate),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      location,
      sensorId,
    });
    
    if (result) {
      res.status(201).json({
        success: true,
        message: 'Flood simulation processed successfully',
        data: result,
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'Simulation processed but no disaster was created (below threshold)',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
});

/**
 * @route   POST /api/simulate/fire
 * @desc    Simulate fire sensor data
 * @access  Public (would be restricted in production)
 */
router.post('/fire', async (req, res) => {
  try {
    const {
      temperature,
      smokeLevel = 0,
      latitude,
      longitude,
      location = 'Unknown location',
      sensorId = 'SIM-FIRE-1',
    } = req.body;
    
    if (!temperature || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Please provide temperature, latitude, and longitude',
      });
    }
    
    const result = await dataStreamService.simulateSensorData('FIRE', {
      temperature: parseFloat(temperature),
      smokeLevel: parseFloat(smokeLevel),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      location,
      sensorId,
    });
    
    if (result) {
      res.status(201).json({
        success: true,
        message: 'Fire simulation processed successfully',
        data: result,
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'Simulation processed but no disaster was created (below threshold)',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
});

export default router; 
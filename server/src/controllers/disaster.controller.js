import DisasterEvent from '../models/DisasterEvent.js';
import { io } from '../app.js';

// Get all disaster events with filtering options
export const getAllDisasters = async (req, res) => {
  try {
    const { type, severity, status, startDate, endDate, limit = 20 } = req.query;
    
    // Build filter object based on query params
    const filter = {};
    
    if (type) filter.type = type;
    if (severity) filter.severity = { $gte: parseInt(severity) };
    if (status) filter.status = status;
    
    // Date filtering
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }
    
    const disasters = await DisasterEvent.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
      
    res.status(200).json({
      success: true,
      count: disasters.length,
      data: disasters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get a single disaster event
export const getDisasterById = async (req, res) => {
  try {
    const disaster = await DisasterEvent.findById(req.params.id);
    
    if (!disaster) {
      return res.status(404).json({
        success: false,
        error: 'Disaster event not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: disaster
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create a new disaster event
export const createDisaster = async (req, res) => {
  try {
    const disaster = await DisasterEvent.create(req.body);
    
    // Emit socket event with new disaster data
    io.to(disaster.type).emit('new-disaster', disaster);
    io.to('ALL').emit('new-disaster', disaster);
    
    res.status(201).json({
      success: true,
      data: disaster
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// Update a disaster event
export const updateDisaster = async (req, res) => {
  try {
    let disaster = await DisasterEvent.findById(req.params.id);
    
    if (!disaster) {
      return res.status(404).json({
        success: false,
        error: 'Disaster event not found'
      });
    }
    
    disaster = await DisasterEvent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    // Emit socket event with updated disaster data
    io.to(disaster.type).emit('update-disaster', disaster);
    io.to('ALL').emit('update-disaster', disaster);
    
    res.status(200).json({
      success: true,
      data: disaster
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete a disaster event
export const deleteDisaster = async (req, res) => {
  try {
    const disaster = await DisasterEvent.findById(req.params.id);
    
    if (!disaster) {
      return res.status(404).json({
        success: false,
        error: 'Disaster event not found'
      });
    }
    
    await disaster.deleteOne();
    
    // Emit socket event for disaster deletion
    io.to(disaster.type).emit('delete-disaster', req.params.id);
    io.to('ALL').emit('delete-disaster', req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get disasters near a location (within a certain radius)
export const getDisastersNearby = async (req, res) => {
  try {
    const { longitude, latitude, radius = 50, unit = 'km' } = req.query;
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        error: 'Please provide longitude and latitude coordinates'
      });
    }
    
    // Convert radius to radians (divide by Earth's radius)
    // Earth's radius: ~6371 km or ~3959 miles
    const earthRadius = unit === 'km' ? 6371 : 3959;
    const radiusInRadians = parseInt(radius) / earthRadius;
    
    const disasters = await DisasterEvent.find({
      location: {
        $geoWithin: {
          $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], radiusInRadians]
        }
      }
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: disasters.length,
      data: disasters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Add a new sensor reading to a disaster event
export const addSensorReading = async (req, res) => {
  try {
    const { sensorId, value } = req.body;
    
    if (!sensorId || value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide sensorId and value'
      });
    }
    
    const disaster = await DisasterEvent.findById(req.params.id);
    
    if (!disaster) {
      return res.status(404).json({
        success: false,
        error: 'Disaster event not found'
      });
    }
    
    // Add new reading to the array
    disaster.readings.push({
      sensorId,
      value,
      timestamp: new Date()
    });
    
    await disaster.save();
    
    // Emit socket event with updated readings
    io.to(disaster.type).emit('new-reading', {
      disasterId: disaster._id,
      reading: disaster.readings[disaster.readings.length - 1]
    });
    
    res.status(200).json({
      success: true,
      data: disaster
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 
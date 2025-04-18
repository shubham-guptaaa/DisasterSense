import AlertConfig from '../models/AlertConfig.js';
import DisasterEvent from '../models/DisasterEvent.js';
import { io } from '../app.js';

// Get all alert configurations
export const getAllAlertConfigs = async (req, res) => {
  try {
    const { disasterType, isActive } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (disasterType) filter.disasterType = disasterType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const alertConfigs = await AlertConfig.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: alertConfigs.length,
      data: alertConfigs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get a single alert configuration
export const getAlertConfigById = async (req, res) => {
  try {
    const alertConfig = await AlertConfig.findById(req.params.id);
    
    if (!alertConfig) {
      return res.status(404).json({
        success: false,
        error: 'Alert configuration not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: alertConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create a new alert configuration
export const createAlertConfig = async (req, res) => {
  try {
    const alertConfig = await AlertConfig.create(req.body);
    
    res.status(201).json({
      success: true,
      data: alertConfig
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

// Update an alert configuration
export const updateAlertConfig = async (req, res) => {
  try {
    let alertConfig = await AlertConfig.findById(req.params.id);
    
    if (!alertConfig) {
      return res.status(404).json({
        success: false,
        error: 'Alert configuration not found'
      });
    }
    
    alertConfig = await AlertConfig.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: alertConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete an alert configuration
export const deleteAlertConfig = async (req, res) => {
  try {
    const alertConfig = await AlertConfig.findById(req.params.id);
    
    if (!alertConfig) {
      return res.status(404).json({
        success: false,
        error: 'Alert configuration not found'
      });
    }
    
    await alertConfig.deleteOne();
    
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

// Process a disaster event and trigger alerts if needed
export const processDisasterAlert = async (disasterId) => {
  try {
    const disaster = await DisasterEvent.findById(disasterId);
    
    if (!disaster) {
      console.error(`Disaster event not found: ${disasterId}`);
      return;
    }
    
    // Skip if alerts have already been sent
    if (disaster.alertsSent) {
      return;
    }
    
    // Find applicable alert configurations
    const alertConfigs = await AlertConfig.find({
      isActive: true,
      $or: [
        { disasterType: disaster.type },
        { disasterType: 'ALL' }
      ],
      severityThreshold: { $lte: disaster.severity }
      // Add geospatial query if location matching is needed
    });
    
    if (alertConfigs.length === 0) {
      console.log(`No alert configurations match disaster: ${disasterId}`);
      return;
    }
    
    // Process each matching alert configuration
    for (const config of alertConfigs) {
      // Check cooldown period
      const now = new Date();
      if (config.lastTriggered && (now - config.lastTriggered) < (config.cooldownPeriod * 60 * 1000)) {
        console.log(`Alert ${config._id} is in cooldown period`);
        continue;
      }
      
      // In a real implementation, send alerts via SMS, email, etc.
      // Here we'll just emit socket events and update timestamps
      
      // Emit alert event to frontend
      io.emit('disaster-alert', {
        disasterId: disaster._id,
        alertConfigId: config._id,
        disasterType: disaster.type,
        severity: disaster.severity,
        location: disaster.location,
        description: disaster.description,
        timestamp: new Date()
      });
      
      // Update the last triggered timestamp
      config.lastTriggered = now;
      await config.save();
    }
    
    // Mark disaster as having alerts sent
    disaster.alertsSent = true;
    await disaster.save();
    
    console.log(`Processed alerts for disaster: ${disasterId}`);
    return true;
  } catch (error) {
    console.error(`Error processing alerts: ${error.message}`);
    return false;
  }
};

// Manual endpoint to trigger alert processing for a disaster
export const triggerAlertProcess = async (req, res) => {
  try {
    const { disasterId } = req.params;
    
    if (!disasterId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide disasterId'
      });
    }
    
    const result = await processDisasterAlert(disasterId);
    
    if (result) {
      res.status(200).json({
        success: true,
        message: 'Alert processing triggered successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error processing alerts'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 
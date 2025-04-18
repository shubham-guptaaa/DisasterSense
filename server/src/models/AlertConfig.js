import mongoose from 'mongoose';

const alertConfigSchema = new mongoose.Schema(
  {
    disasterType: {
      type: String,
      required: true,
      enum: ['EARTHQUAKE', 'FLOOD', 'FIRE', 'STORM', 'ALL'],
    },
    region: {
      type: {
        type: String,
        enum: ['Point', 'Polygon'],
        default: 'Polygon',
      },
      coordinates: {
        type: [[[Number]]], // Array of polygon points or single point with radius
        required: true,
      },
    },
    severityThreshold: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    channels: {
      sms: {
        enabled: {
          type: Boolean,
          default: false,
        },
        recipients: [String], // Phone numbers
      },
      email: {
        enabled: {
          type: Boolean,
          default: false,
        },
        recipients: [String], // Email addresses
      },
      push: {
        enabled: {
          type: Boolean,
          default: true,
        },
      },
      emergencyServices: {
        enabled: {
          type: Boolean,
          default: false,
        },
        serviceIds: [String], // IDs of emergency services to notify
      },
    },
    cooldownPeriod: {
      type: Number, // In minutes
      default: 30,
    },
    lastTriggered: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
  },
  { timestamps: true }
);

// Create index for geospatial queries
alertConfigSchema.index({ region: '2dsphere' });

const AlertConfig = mongoose.model('AlertConfig', alertConfigSchema);

export default AlertConfig; 
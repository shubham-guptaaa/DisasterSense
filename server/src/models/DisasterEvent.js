import mongoose from 'mongoose';

const disasterEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['EARTHQUAKE', 'FLOOD', 'FIRE', 'STORM', 'OTHER'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    severity: {
      type: Number, // 1-10 scale
      required: true,
      min: 1,
      max: 10,
    },
    description: {
      type: String,
      required: true,
    },
    affectedArea: {
      type: Number, // in square kilometers
      default: 0,
    },
    status: {
      type: String,
      enum: ['DETECTED', 'MONITORING', 'RESPONDING', 'CONTAINED', 'RESOLVED'],
      default: 'DETECTED',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    readings: [
      {
        sensorId: String,
        value: Number,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    alertsSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create index for geospatial queries
disasterEventSchema.index({ location: '2dsphere' });

const DisasterEvent = mongoose.model('DisasterEvent', disasterEventSchema);

export default DisasterEvent; 
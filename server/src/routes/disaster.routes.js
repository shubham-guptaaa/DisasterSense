import express from 'express';
import {
  getAllDisasters,
  getDisasterById,
  createDisaster,
  updateDisaster,
  deleteDisaster,
  getDisastersNearby,
  addSensorReading
} from '../controllers/disaster.controller.js';

const router = express.Router();

// Main CRUD routes
router.get('/', getAllDisasters);
router.get('/:id', getDisasterById);
router.post('/', createDisaster);
router.put('/:id', updateDisaster);
router.delete('/:id', deleteDisaster);

// Special routes
router.get('/nearby', getDisastersNearby);
router.post('/:id/readings', addSensorReading);

export default router; 
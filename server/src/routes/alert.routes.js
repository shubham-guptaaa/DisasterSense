import express from 'express';
import {
  getAllAlertConfigs,
  getAlertConfigById,
  createAlertConfig,
  updateAlertConfig,
  deleteAlertConfig,
  triggerAlertProcess
} from '../controllers/alert.controller.js';

const router = express.Router();

// Main CRUD routes
router.get('/', getAllAlertConfigs);
router.get('/:id', getAlertConfigById);
router.post('/', createAlertConfig);
router.put('/:id', updateAlertConfig);
router.delete('/:id', deleteAlertConfig);

// Special routes
router.post('/trigger/:disasterId', triggerAlertProcess);

export default router; 
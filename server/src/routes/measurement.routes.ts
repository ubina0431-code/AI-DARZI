import { Router } from 'express';
import {
  getMyMeasurements, getMeasurementById, createMeasurement,
  adviseMeasurements,
  updateMeasurement, deleteMeasurement, startAIMeasurementSession,
  processAIMeasurement, saveMeasurementsFromSession,
} from '../controllers/measurement.controller';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate, authorize('customer', 'tailor'));

router.get('/', getMyMeasurements);
router.post('/ai/advisor', adviseMeasurements);
router.post('/', createMeasurement);
router.get('/:id', getMeasurementById);
router.put('/:id', updateMeasurement);
router.delete('/:id', deleteMeasurement);

// AI measurement workflow
router.post('/ai/session', startAIMeasurementSession);
router.post('/ai/session/:sessionId/process', upload.array('photos', 3), processAIMeasurement);
router.post('/ai/session/:sessionId/save', saveMeasurementsFromSession);

export default router;

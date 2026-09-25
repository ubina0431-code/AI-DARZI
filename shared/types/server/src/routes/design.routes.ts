import { Router } from 'express';
import {
  getMyDesigns, getDesignById, generateDesignFromPrompt, refineDesign,
  saveDesign, deleteDesign, duplicateDesign, createManualDesign,
} from '../controllers/design.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('customer'));

router.get('/', getMyDesigns);
router.post('/', createManualDesign);
router.post('/generate', generateDesignFromPrompt);
router.get('/:id', getDesignById);
router.put('/:id', saveDesign);
router.post('/:id/refine', refineDesign);
router.delete('/:id', deleteDesign);
router.post('/:id/duplicate', duplicateDesign);

export default router;

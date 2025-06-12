import { Router } from 'express';
import { getAllAccreditationsController } from '../controllers/accreditations.controllers';

const router = Router();

router.get('/', getAllAccreditationsController)

export default router;
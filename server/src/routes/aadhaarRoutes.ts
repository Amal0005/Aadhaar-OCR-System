import { Router } from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { processOCR } from '../controllers/AadhaarController';

const router = Router();

router.post('/process', upload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 }
]), processOCR);

export default router;

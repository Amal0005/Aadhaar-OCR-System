import express from 'express';
import { AadhaarController } from '../controllers/AadhaarController';
import { uploadMiddleware } from '../middleware/uploadMiddleware';

const router = express.Router();
const aadhaarController = new AadhaarController();

router.post('/process', uploadMiddleware.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 }
]), (req, res) => aadhaarController.processOCR(req, res));

export default router;

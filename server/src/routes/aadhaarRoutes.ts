import express from 'express';
import { AadhaarController } from '../controllers/AadhaarController.js';
import { AadhaarService } from '../services/AadhaarService.js';
import { OCRService } from '../services/OCRService.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

const ocrService = new OCRService();
const aadhaarService = new AadhaarService(ocrService);
const aadhaarController = new AadhaarController(aadhaarService);

router.post('/process', uploadMiddleware.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 }
]), (req, res, next) => aadhaarController.processOCR(req, res, next));

export default router;

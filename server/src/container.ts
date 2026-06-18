import { OCRService } from './services/OCRService';
import { AadhaarService } from './services/AadhaarService';

const ocrService = new OCRService();
const aadhaarService = new AadhaarService(ocrService);

export { aadhaarService };

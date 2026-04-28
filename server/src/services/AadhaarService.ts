import { OCRService } from './OCRService';
import fs from 'fs';

export class AadhaarService {
    private ocr = new OCRService();

    async processAadhaar(frontPath: string, backPath?: string) {
        // Process Front Side
        const frontText = await this.ocr.processImage(frontPath);
        const frontData = this.ocr.parseData(frontText);

        let finalData = { ...frontData };

        // Process Back Side if provided
        if (backPath) {
            const backText = await this.ocr.processImage(backPath);
            const backData = this.ocr.parseData(backText);
            
            // Prefer address and pincode from the back side
            if (backData.address !== 'Unknown') finalData.address = backData.address;
            if (backData.pincode !== 'Unknown') finalData.pincode = backData.pincode;
        }

        [frontPath, backPath].forEach(path => path && fs.existsSync(path) && fs.unlinkSync(path));
        
        return finalData;
    }
}

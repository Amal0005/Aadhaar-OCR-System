import { OCRService } from './OCRService';
import fs from 'fs';

export class AadhaarService {
    private ocr = new OCRService();

    async processAadhaar(frontPath: string, backPath: string) {
        try {
            // Process Front Side
            const frontText = await this.ocr.processImage(frontPath);
            const frontData = this.ocr.parseData(frontText);

            // Validation: Front side should have at least Name or DOB or Aadhaar Number
            if (frontData.name === 'Unknown' && frontData.dob === 'Unknown' && frontData.aadhaarNumber === 'Unknown') {
                throw new Error('The "Front Side" image does not appear to be the front of an Aadhaar card. Please ensure you uploaded the side with your photo and name.');
            }

            // Process Back Side
            const backText = await this.ocr.processImage(backPath);
            const backData = this.ocr.parseData(backText);
            
            // Validation: Back side should have Address or Pincode
            if (backData.address === 'Unknown' && backData.pincode === 'Unknown') {
                throw new Error('The "Back Side" image does not appear to be the back of an Aadhaar card. Please ensure you uploaded the side containing your address.');
            }

            let finalData = { ...frontData };
            
            // Prefer address and pincode from the back side
            if (backData.address !== 'Unknown') finalData.address = backData.address;
            if (backData.pincode !== 'Unknown') finalData.pincode = backData.pincode;

            return finalData;
        } finally {
            [frontPath, backPath].forEach(path => {
                if (path && fs.existsSync(path)) {
                    fs.unlinkSync(path);
                }
            });
        }
    }
}

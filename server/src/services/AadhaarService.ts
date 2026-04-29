import { OCRService } from './OCRService';
import fs from 'fs';

export class AadhaarService {
    private ocr = new OCRService();

    async processAadhaar(frontPath: string, backPath: string) {
        try {
            // Process Front Side
            const frontText = await this.ocr.processImage(frontPath);
            const frontData = this.ocr.parseData(frontText);

            // Validation: Front side should have at least Name or DOB
            if (frontData.name === 'Unknown' && frontData.dob === 'Unknown') {
                if (frontData.address !== 'Unknown') {
                    throw new Error('It looks like you uploaded the Back Side in the "Front Side" slot. Please upload the side with your photo and name.');
                }
                throw new Error('The "Front Side" image does not appear to be the front of an Aadhaar card.');
            }

            // Process Back Side
            const backText = await this.ocr.processImage(backPath);
            const backData = this.ocr.parseData(backText);
            
            // Validation: Back side should have a valid Address or Pincode
            const isAddressInvalid = !backData.address || backData.address === 'Unknown' || backData.address.length < 10;
            const isPincodeInvalid = !backData.pincode || backData.pincode === 'Unknown';

            // ANTI-DUPLICATE CHECK: If the back side has a name, it's likely the front side again!
            if (backData.name !== 'Unknown' && (isAddressInvalid && isPincodeInvalid)) {
                throw new Error('It looks like you uploaded the Front Side of the card in the "Back Side" slot. Please upload the side containing your address.');
            }

            if (isAddressInvalid && isPincodeInvalid) {
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

import { OCRService } from './OCRService';
import fs from 'fs';

export class AadhaarService {
    private ocr = new OCRService();

    async processAadhaar(frontPath: string, backPath: string) {
        try {
            // 1. Process Front Side
            const frontText = await this.ocr.processImage(frontPath);
            const frontData = this.ocr.parseData(frontText);

            // KEYWORD CHECK: Does this even look like an Aadhaar document?
            const aadhaarKeywords = ['aadhaar', 'unique', 'government', 'india', 'identification'];
            const lowerFrontText = frontText.toLowerCase();
            const hasFrontKeywords = aadhaarKeywords.some(k => lowerFrontText.includes(k));

            if (frontData.aadhaarNumber === 'Unknown' && !hasFrontKeywords) {
                throw new Error('The "Front Side" image does not appear to be a valid Aadhaar document. Please upload a clear image of your Aadhaar card.');
            }

            // Validation: Front side should have at least Name or DOB
            if (frontData.name === 'Unknown' && frontData.dob === 'Unknown') {
                if (frontData.address !== 'Unknown') {
                    throw new Error('It looks like you uploaded the Back Side in the "Front Side" slot. Please upload the side with your photo and name.');
                }
                throw new Error('Could not find Name or Date of Birth on the Front Side. Please upload a clearer image.');
            }

            // 2. Process Back Side
            const backText = await this.ocr.processImage(backPath);
            const backData = this.ocr.parseData(backText);
            
            const lowerBackText = backText.toLowerCase();
            const hasBackKeywords = aadhaarKeywords.some(k => lowerBackText.includes(k));

            if (backData.aadhaarNumber === 'Unknown' && !hasBackKeywords && backData.pincode === 'Unknown') {
                throw new Error('The "Back Side" image does not appear to be a valid Aadhaar document. Please upload the side containing your address.');
            }

            // DUPLICATE IMAGE CHECK: Ensure the user didn't upload the exact same side twice
            if (frontText.trim() === backText.trim()) {
                throw new Error('You have uploaded the same image for both sides. Please upload the Front side and Back side separately.');
            }
            
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

            // AADHAAR NUMBER MATCH CHECK: Ensure front and back belong to the same person
            if (frontData.aadhaarNumber !== 'Unknown' && 
                backData.aadhaarNumber !== 'Unknown' && 
                frontData.aadhaarNumber.replace(/\D/g, '') !== backData.aadhaarNumber.replace(/\D/g, '')) {
                throw new Error('The Aadhaar number on the front image does not match the one on the back image. Please upload images of the same Aadhaar card.');
            }

            let finalData = { ...frontData };
            
            // Prefer address and pincode from the back side
            if (backData.address !== 'Unknown') finalData.address = backData.address;
            if (backData.pincode !== 'Unknown') finalData.pincode = backData.pincode;

            // Fallback for Aadhaar number if missing on front but present on back
            if (finalData.aadhaarNumber === 'Unknown' && backData.aadhaarNumber !== 'Unknown') {
                finalData.aadhaarNumber = backData.aadhaarNumber;
            }

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

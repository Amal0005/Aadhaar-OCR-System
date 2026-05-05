import { OCRService } from './OCRService.js';
import fs from 'fs';
import { ErrorMessages } from '../constants/ErrorMessages.js';
import { AadhaarDataSchema } from '../schemas/AadhaarSchema.js';

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
                throw new Error(ErrorMessages.INVALID_FRONT_IMAGE);
            }

            // Validation: Front side should have at least Name or DOB
            if (frontData.name === 'Unknown' && frontData.dob === 'Unknown') {
                if (frontData.address !== 'Unknown') {
                    throw new Error(ErrorMessages.FRONT_BACK_MISMATCH_SLOT_FRONT);
                }
                throw new Error(ErrorMessages.FRONT_DATA_NOT_FOUND);
            }

            // 2. Process Back Side
            const backText = await this.ocr.processImage(backPath);
            const backData = this.ocr.parseData(backText);
            
            const lowerBackText = backText.toLowerCase();
            const hasBackKeywords = aadhaarKeywords.some(k => lowerBackText.includes(k));

            if (backData.aadhaarNumber === 'Unknown' && !hasBackKeywords && backData.pincode === 'Unknown') {
                throw new Error(ErrorMessages.INVALID_BACK_IMAGE);
            }

            // DUPLICATE IMAGE CHECK: Ensure the user didn't upload the exact same side twice
            if (frontText.trim() === backText.trim()) {
                throw new Error(ErrorMessages.DUPLICATE_IMAGES);
            }
            
            // Validation: Back side should have a valid Address or Pincode
            const isAddressInvalid = !backData.address || backData.address === 'Unknown' || backData.address.length < 10;
            const isPincodeInvalid = !backData.pincode || backData.pincode === 'Unknown';

            // ANTI-DUPLICATE CHECK: If the back side has a name, it's likely the front side again!
            if (backData.name !== 'Unknown' && (isAddressInvalid && isPincodeInvalid)) {
                throw new Error(ErrorMessages.FRONT_BACK_MISMATCH_SLOT_BACK);
            }

            if (isAddressInvalid && isPincodeInvalid) {
                throw new Error(ErrorMessages.BACK_SIDE_NOT_RECOGNIZED);
            }

            // AADHAAR NUMBER MATCH CHECK: Ensure front and back belong to the same person
            if (frontData.aadhaarNumber !== 'Unknown' && 
                backData.aadhaarNumber !== 'Unknown' && 
                frontData.aadhaarNumber.replace(/\D/g, '') !== backData.aadhaarNumber.replace(/\D/g, '')) {
                throw new Error(ErrorMessages.AADHAAR_NUMBER_MISMATCH);
            }

            let finalData = { ...frontData };
            
            // Prefer address and pincode from the back side
            if (backData.address !== 'Unknown') finalData.address = backData.address;
            if (backData.pincode !== 'Unknown') finalData.pincode = backData.pincode;

            // Fallback for Aadhaar number if missing on front but present on back
            if (finalData.aadhaarNumber === 'Unknown' && backData.aadhaarNumber !== 'Unknown') {
                finalData.aadhaarNumber = backData.aadhaarNumber;
            }

            return AadhaarDataSchema.parse(finalData);
        } finally {
            [frontPath, backPath].forEach(path => {
                if (path && fs.existsSync(path)) {
                    fs.unlinkSync(path);
                }
            });
        }
    }
}

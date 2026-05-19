import fs from 'fs';
import { ErrorMessages } from '../constants/ErrorMessages.js';
import { AadhaarDataSchema } from '../schemas/AadhaarSchema.js';
import { AppError } from '../utils/AppError.js';
import { HttpStatus } from '../constants/HttpStatus.js';

import { IAadhaarService, IOCRService } from '../interfaces/IServices.js';

export class AadhaarService implements IAadhaarService {
    constructor(private ocr: IOCRService) { }

    async processAadhaar(frontPath: string, backPath: string) {
        try {
            const frontText = await this.ocr.processImage(frontPath);
            const frontData = this.ocr.parseData(frontText);

            const aadhaarKeywords = ['aadhaar', 'unique', 'government', 'india', 'identification'];
            const lowerFrontText = frontText.toLowerCase();
            const hasFrontKeywords = aadhaarKeywords.some(k => lowerFrontText.includes(k));

            if (frontData.aadhaarNumber === 'Unknown' && !hasFrontKeywords) {
                throw new AppError(ErrorMessages.INVALID_FRONT_IMAGE, HttpStatus.BAD_REQUEST);
            }

            if (frontData.name === 'Unknown' && frontData.dob === 'Unknown') {
                if (frontData.address !== 'Unknown') {
                    throw new AppError(ErrorMessages.FRONT_BACK_MISMATCH_SLOT_FRONT, HttpStatus.BAD_REQUEST);
                }
                throw new AppError(ErrorMessages.FRONT_DATA_NOT_FOUND, HttpStatus.BAD_REQUEST);
            }

            const backText = await this.ocr.processImage(backPath);
            const backData = this.ocr.parseData(backText);

            const lowerBackText = backText.toLowerCase();
            const hasBackKeywords = aadhaarKeywords.some(k => lowerBackText.includes(k));

            if (backData.aadhaarNumber === 'Unknown' && !hasBackKeywords && backData.pincode === 'Unknown') {
                throw new AppError(ErrorMessages.INVALID_BACK_IMAGE, HttpStatus.BAD_REQUEST);
            }

            // DUPLICATE IMAGE CHECK: Ensure the user didn't upload the exact same side twice
            if (frontText.trim() === backText.trim()) {
                throw new AppError(ErrorMessages.DUPLICATE_IMAGES, HttpStatus.BAD_REQUEST);
            }

            // Validation: Back side should have a valid Address or Pincode
            const isAddressInvalid = !backData.address || backData.address === 'Unknown' || backData.address.length < 10;
            const isPincodeInvalid = !backData.pincode || backData.pincode === 'Unknown';

            // ANTI-DUPLICATE CHECK: If the back side has a name, it's likely the front side again!
            if (backData.name !== 'Unknown' && (isAddressInvalid && isPincodeInvalid)) {
                throw new AppError(ErrorMessages.FRONT_BACK_MISMATCH_SLOT_BACK, HttpStatus.BAD_REQUEST);
            }

            if (isAddressInvalid && isPincodeInvalid) {
                throw new AppError(ErrorMessages.BACK_SIDE_NOT_RECOGNIZED, HttpStatus.BAD_REQUEST);
            }

            // AADHAAR NUMBER MATCH CHECK: Ensure front and back belong to the same person
            if (frontData.aadhaarNumber !== 'Unknown' &&
                backData.aadhaarNumber !== 'Unknown' &&
                frontData.aadhaarNumber.replace(/\D/g, '') !== backData.aadhaarNumber.replace(/\D/g, '')) {
                throw new AppError(ErrorMessages.AADHAAR_NUMBER_MISMATCH, HttpStatus.BAD_REQUEST);
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

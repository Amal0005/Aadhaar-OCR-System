import fs from 'fs';
import { ErrorMessages } from '../constants/ErrorMessages';
import { AadhaarDataSchema } from '../schemas/AadhaarSchema';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';

import { IAadhaarService, IOCRService } from '../interfaces/IServices';

export class AadhaarService implements IAadhaarService {
    constructor(private _ocr: IOCRService) { }

    async processAadhaar(frontPath: string, backPath: string) {
        try {
            const text1 = await this._ocr.processImage(frontPath);
            const data1 = this._ocr.parseData(text1);

            const text2 = await this._ocr.processImage(backPath);
            const data2 = this._ocr.parseData(text2);

            const getScores = (data: any) => {
                let frontScore = 0;
                let backScore = 0;
                if (data.name !== 'Unknown') frontScore += 2;
                if (data.dob !== 'Unknown') frontScore += 2;
                if (data.address === 'Unknown') frontScore += 1;
                if (data.pincode === 'Unknown') frontScore += 1;

                if (data.address !== 'Unknown') backScore += 2;
                if (data.pincode !== 'Unknown') backScore += 2;
                if (data.name === 'Unknown') backScore += 1;
                if (data.dob === 'Unknown') backScore += 1;

                return { frontScore, backScore };
            };

            const score1 = getScores(data1);
            const score2 = getScores(data2);

            let finalFrontText = text1;
            let finalFrontData = data1;
            let finalBackText = text2;
            let finalBackData = data2;

            const isSwapped = (score2.frontScore + score1.backScore) > (score1.frontScore + score2.backScore);
            if (isSwapped) {
                finalFrontText = text2;
                finalFrontData = data2;
                finalBackText = text1;
                finalBackData = data1;
            }

            const aadhaarKeywords = ['aadhaar', 'unique', 'government', 'india', 'identification'];
            const lowerFrontText = finalFrontText.toLowerCase();
            const hasFrontKeywords = aadhaarKeywords.some(k => lowerFrontText.includes(k));

            if (finalFrontData.aadhaarNumber === 'Unknown' && !hasFrontKeywords) {
                throw new AppError(ErrorMessages.INVALID_FRONT_IMAGE, HttpStatus.BAD_REQUEST);
            }

            if (finalFrontData.name === 'Unknown' && finalFrontData.dob === 'Unknown') {
                if (finalFrontData.address !== 'Unknown') {
                    throw new AppError(ErrorMessages.FRONT_BACK_MISMATCH_SLOT_FRONT, HttpStatus.BAD_REQUEST);
                }
                throw new AppError(ErrorMessages.FRONT_DATA_NOT_FOUND, HttpStatus.BAD_REQUEST);
            }

            const lowerBackText = finalBackText.toLowerCase();
            const hasBackKeywords = aadhaarKeywords.some(k => lowerBackText.includes(k));

            if (finalBackData.aadhaarNumber === 'Unknown' && !hasBackKeywords && finalBackData.pincode === 'Unknown') {
                throw new AppError(ErrorMessages.INVALID_BACK_IMAGE, HttpStatus.BAD_REQUEST);
            }

            if (finalFrontText.trim() === finalBackText.trim()) {
                throw new AppError(ErrorMessages.DUPLICATE_IMAGES, HttpStatus.BAD_REQUEST);
            }

            const isAddressInvalid = !finalBackData.address || finalBackData.address === 'Unknown' || finalBackData.address.length < 10;
            const isPincodeInvalid = !finalBackData.pincode || finalBackData.pincode === 'Unknown';

            if (finalBackData.name !== 'Unknown' && (isAddressInvalid && isPincodeInvalid)) {
                throw new AppError(ErrorMessages.FRONT_BACK_MISMATCH_SLOT_BACK, HttpStatus.BAD_REQUEST);
            }

            if (isAddressInvalid && isPincodeInvalid) {
                throw new AppError(ErrorMessages.BACK_SIDE_NOT_RECOGNIZED, HttpStatus.BAD_REQUEST);
            }

            if (finalFrontData.aadhaarNumber !== 'Unknown' &&
                finalBackData.aadhaarNumber !== 'Unknown' &&
                finalFrontData.aadhaarNumber.replace(/\D/g, '') !== finalBackData.aadhaarNumber.replace(/\D/g, '')) {
                throw new AppError(ErrorMessages.AADHAAR_NUMBER_MISMATCH, HttpStatus.BAD_REQUEST);
            }

            let finalData = { ...finalFrontData };

            if (finalBackData.address !== 'Unknown') finalData.address = finalBackData.address;
            if (finalBackData.pincode !== 'Unknown') finalData.pincode = finalBackData.pincode;

            if (finalData.aadhaarNumber === 'Unknown' && finalBackData.aadhaarNumber !== 'Unknown') {
                finalData.aadhaarNumber = finalBackData.aadhaarNumber;
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

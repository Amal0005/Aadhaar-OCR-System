import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../constants/HttpStatus.js';
import { ErrorMessages } from '../constants/ErrorMessages.js';
import { AppError } from '../utils/AppError.js';

import { IAadhaarService } from '../interfaces/IServices.js';

export class AadhaarController {
    constructor(private aadhaarService: IAadhaarService) {}

    async processOCR(req: Request, res: Response, next: NextFunction) {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (!files || !files['frontImage'] || !files['backImage']) {
                throw new AppError(ErrorMessages.MISSING_IMAGES, HttpStatus.BAD_REQUEST);
            }

            const frontImagePath = files['frontImage'][0].path;
            const backImagePath = files['backImage'][0].path;

            const result = await this.aadhaarService.processAadhaar(frontImagePath, backImagePath);

            res.status(HttpStatus.OK).json({
                success: true,
                data: result
            });
        } catch (error: unknown) {
            next(error);
        }
    }
}

import { Request, Response } from 'express';
import { AadhaarService } from '../services/AadhaarService.js';
import { HttpStatus } from '../constants/HttpStatus.js';
import { ErrorMessages } from '../constants/ErrorMessages.js';

const aadhaarService = new AadhaarService();

export class AadhaarController {
    async processOCR(req: Request, res: Response) {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (!files || !files['frontImage'] || !files['backImage']) {
                return res.status(HttpStatus.BAD_REQUEST).json({ 
                    success: false, 
                    error: ErrorMessages.MISSING_IMAGES 
                });
            }

            const frontImagePath = files['frontImage'][0].path;
            const backImagePath = files['backImage'][0].path;

            const result = await aadhaarService.processAadhaar(frontImagePath, backImagePath);

            res.status(HttpStatus.OK).json({
                success: true,
                data: result
            });
        } catch (error: unknown) {
            console.error('Controller Error:', error);
            const message = error instanceof Error ? error.message : ErrorMessages.INTERNAL_SERVER_ERROR;
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: message
            });
        }
    }
}

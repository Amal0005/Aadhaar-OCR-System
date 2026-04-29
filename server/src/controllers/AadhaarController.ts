import { Request, Response } from 'express';
import { AadhaarService } from '../services/AadhaarService';

const aadhaarService = new AadhaarService();

export class AadhaarController {
    async processOCR(req: Request, res: Response) {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (!files || !files['frontImage'] || !files['backImage']) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Both Front and Back images of the Aadhaar card are required for processing.' 
                });
            }

            const frontImagePath = files['frontImage'][0].path;
            const backImagePath = files['backImage'][0].path;

            const result = await aadhaarService.processAadhaar(frontImagePath, backImagePath);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: unknown) {
            console.error('Controller Error:', error);
            const message = error instanceof Error ? error.message : 'Internal Server Error';
            res.status(500).json({
                success: false,
                error: message
            });
        }
    }
}

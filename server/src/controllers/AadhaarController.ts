import { Request, Response } from 'express';
import { AadhaarService } from '../services/AadhaarService';

const aadhaarService = new AadhaarService();

export class AadhaarController {
    async processOCR(req: Request, res: Response) {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (!files || !files['frontImage']) {
                return res.status(400).json({ error: 'Front image is required' });
            }

            const frontImagePath = files['frontImage'][0].path;
            const backImagePath = files['backImage'] ? files['backImage'][0].path : undefined;

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

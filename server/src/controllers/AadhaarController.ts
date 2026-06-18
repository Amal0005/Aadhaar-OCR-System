import { Request, Response } from 'express';
import { aadhaarService } from '../container';
import { AppError } from '../utils/AppError';

export const processOCR = async (req: Request, res: Response) => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (!files?.frontImage || !files?.backImage) {
            res.status(400).json({ success: false, message: 'Both frontImage and backImage are required' });
            return;
        }

        const result = await aadhaarService.processAadhaar(
            files['frontImage'][0].path,
            files['backImage'][0].path
        );

        res.status(200).json({ success: true, data: result });
    } catch (error: unknown) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};
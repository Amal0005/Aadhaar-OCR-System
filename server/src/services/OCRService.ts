import axios from 'axios';
import FormData from 'form-data';
import sharp from 'sharp';
import { IOCRService } from '../interfaces/IServices';
import { env } from '../config/env';

export class OCRService implements IOCRService {
    private _apiKey: string = env.OCR_SPACE_API_KEY;
    private _apiUrl: string = env.OCR_API_URL;

    async processImage(imagePath: string): Promise<string> {
        const buffer = await sharp(imagePath).resize(1000).jpeg({ quality: 75 }).toBuffer();

        const formData = new FormData();
        formData.append('apikey', this._apiKey);
        formData.append('file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });

        try {
            const { data } = await axios.post(this._apiUrl, formData, { headers: formData.getHeaders() });
            if (data.IsErroredOnProcessing) throw new Error(data.ErrorMessage[0]);
            return data.ParsedResults?.[0]?.ParsedText || '';
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.ErrorMessage?.[0] || error.message);
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('An unknown error occurred during OCR processing');
        }
    }

    parseData(text: string) {
        const sanitizedText = text.replace(/[^\x20-\x7E\n]/g, ' ');

        const lines = sanitizedText.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 2);

        const fullText = lines.join(' ');

        const aadhaarMatch = fullText.match(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/);
        const aadhaarNumber = aadhaarMatch ? aadhaarMatch[0] : 'Unknown';

        const dobMatch = fullText.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
        let dob = dobMatch ? dobMatch[0] : 'Unknown';
        if (dob === 'Unknown') {
            const yearMatch = fullText.match(/(?:Year of Birth|YOB)[:\s]*(\d{4})/i);
            if (yearMatch) dob = yearMatch[1];
        }

        let gender = 'Unknown';
        if (/female/i.test(fullText)) gender = 'Female';
        else if (/male/i.test(fullText)) gender = 'Male';

        const pincodeMatch = fullText.match(/\b\d{6}\b/);
        const pincode = pincodeMatch ? pincodeMatch[0] : 'Unknown';

        let name = 'Unknown';
        const headers = ['government', 'india', 'unique', 'identification', 'authority', 'aadhaar', 'enrollment', 'male', 'female', 'dob', 'birth', 'sarkar', 'bharat'];

        for (const line of lines) {
            const cleanLine = line.replace(/[^a-zA-Z\s]/g, '').trim();
            const lowerLine = cleanLine.toLowerCase();

            if (cleanLine.split(' ').length >= 2 &&
                !headers.some(h => lowerLine.includes(h)) &&
                !/\d/.test(line)) {
                name = cleanLine;
                break;
            }
        }

        let address = 'Unknown';
        const addressRegex = /(?:Address|C\/O|W\/O|S\/O|D\/O)[:\s]+([\s\S]+?)(?=\d{4}\s\d{4}\s\d{4}|$)/i;
        const addressMatch = sanitizedText.match(addressRegex);

        if (addressMatch) {
            address = addressMatch[1]
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            const pMatch = address.match(/\d{6}/);
            if (pMatch && pMatch.index !== undefined) {
                address = address.substring(0, pMatch.index + 6);
            }
        } else {
            if (pincode !== 'Unknown') {
                const pincodeIndex = fullText.indexOf(pincode);
                if (pincodeIndex > 20) {
                    const possibleAddress = fullText.substring(pincodeIndex - 100, pincodeIndex + 6).trim();
                    address = possibleAddress.replace(/.*?(?:Address|[:])\s*/i, '').trim();
                }
            }
        }

        return { name, dob, gender, aadhaarNumber, address, pincode };
    }
}

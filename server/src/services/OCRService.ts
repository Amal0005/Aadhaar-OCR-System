import axios from 'axios';
import FormData from 'form-data';
import sharp from 'sharp';
import { IOCRService } from '../interfaces/IServices.js';

export class OCRService implements IOCRService {
    private apiKey: string = process.env.OCR_SPACE_API_KEY || 'helloworld';
    private apiUrl: string = process.env.OCR_API_URL || 'https://api.ocr.space/parse/image';

    async processImage(imagePath: string): Promise<string> {
        const buffer = await sharp(imagePath).resize(1000).jpeg({ quality: 75 }).toBuffer();
        
        const formData = new FormData();
        formData.append('apikey', this.apiKey);
        formData.append('file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });

        try {
            const { data } = await axios.post(this.apiUrl, formData, { headers: formData.getHeaders() });
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
        // 1. Sanitize text: Remove non-ASCII characters to filter out local languages
        const sanitizedText = text.replace(/[^\x20-\x7E\n]/g, ' ');
        
        const lines = sanitizedText.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 2);
        
        const fullText = lines.join(' ');

        // 2. Extract Aadhaar Number (XXXX XXXX XXXX or XXXXXXXXXXXX)
        const aadhaarMatch = fullText.match(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/);
        const aadhaarNumber = aadhaarMatch ? aadhaarMatch[0] : 'Unknown';

        // 3. Extract Date of Birth
        // Matches DD/MM/YYYY or Year of Birth
        const dobMatch = fullText.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
        let dob = dobMatch ? dobMatch[0] : 'Unknown';
        if (dob === 'Unknown') {
            const yearMatch = fullText.match(/(?:Year of Birth|YOB)[:\s]*(\d{4})/i);
            if (yearMatch) dob = yearMatch[1];
        }

        // 4. Extract Gender
        let gender = 'Unknown';
        if (/female/i.test(fullText)) gender = 'Female';
        else if (/male/i.test(fullText)) gender = 'Male';

        // 5. Extract Pincode (6 digits)
        const pincodeMatch = fullText.match(/\b\d{6}\b/);
        const pincode = pincodeMatch ? pincodeMatch[0] : 'Unknown';

        // 6. Extract Name
        // We look for a line that is mostly English alphabets, not a header, and usually has 2-3 words.
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

        // 7. Extract Address
        let address = 'Unknown';
        // Address usually starts with Address, C/O, W/O, S/O, D/O
        const addressRegex = /(?:Address|C\/O|W\/O|S\/O|D\/O)[:\s]+([\s\S]+?)(?=\d{4}\s\d{4}\s\d{4}|$)/i;
        const addressMatch = sanitizedText.match(addressRegex);
        
        if (addressMatch) {
            address = addressMatch[1]
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            // Limit address until pincode if it's too long
            const pMatch = address.match(/\d{6}/);
            if (pMatch && pMatch.index !== undefined) {
                address = address.substring(0, pMatch.index + 6);
            }
        } else {
            // Fallback: If no explicit label, try to find text before pincode
            if (pincode !== 'Unknown') {
                const pincodeIndex = fullText.indexOf(pincode);
                if (pincodeIndex > 20) {
                    const possibleAddress = fullText.substring(pincodeIndex - 100, pincodeIndex + 6).trim();
                    // Clean it up
                    address = possibleAddress.replace(/.*?(?:Address|[:])\s*/i, '').trim();
                }
            }
        }

        return { name, dob, gender, aadhaarNumber, address, pincode };
    }
}

import axios from 'axios';
import FormData from 'form-data';
import sharp from 'sharp';

export class OCRService {
    private apiKey: string = process.env.OCR_SPACE_API_KEY || 'helloworld';
    private apiUrl: string = 'https://api.ocr.space/parse/image';

    async processImage(imagePath: string): Promise<string> {
        const buffer = await sharp(imagePath).resize(1000).jpeg({ quality: 75 }).toBuffer();
        const formData = new FormData();
        formData.append('apikey', this.apiKey);
        formData.append('file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });

        try {
            const { data } = await axios.post(this.apiUrl, formData, { headers: formData.getHeaders() });
            if (data.IsErroredOnProcessing) throw new Error(data.ErrorMessage[0]);
            return data.ParsedResults?.[0]?.ParsedText || '';
        } catch (error: any) {
            throw new Error(error.response?.data?.ErrorMessage?.[0] || error.message);
        }
    }

    parseData(text: string) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
        const cleanText = text.replace(/\s+/g, ' ');

        // 1. Broad DOB Extraction (Regex)
        // Matches DD/MM/YYYY or DD-MM-YYYY with optional spaces
        const dobMatch = cleanText.match(/(\d{2}[\/\-\s]+\d{2}[\/\-\s]+\d{4})/);
        let dob = dobMatch ? dobMatch[0].replace(/\s+/g, '') : 'Unknown';

        // 2. Fallback: If no full date, look for Year of Birth (4 digits)
        if (dob === 'Unknown') {
            const yearMatch = cleanText.match(/(\d{4})/);
            if (yearMatch && parseInt(yearMatch[0]) > 1900 && parseInt(yearMatch[0]) < 2100) {
                dob = yearMatch[0];
            }
        }

        const aadhaar = cleanText.match(/(\d{4}\s\d{4}\s\d{4})/)?.[0] || 'Unknown';
        const gender = cleanText.toLowerCase().includes('female') ? 'Female' : (cleanText.toLowerCase().includes('male') ? 'Male' : 'Other');
        const pincode = cleanText.match(/\b\d{6}\b/)?.[0] || 'Unknown';

        // Address Extraction (Look for the line with pincode and go upwards)
        let address = 'Unknown';
        const pincodeLineIndex = lines.findIndex(l => l.includes(pincode));
        if (pincodeLineIndex !== -1) {
            // Take 2 lines before the pincode as well
            const start = Math.max(0, pincodeLineIndex - 2);
            address = lines.slice(start, pincodeLineIndex + 1).join(', ');
        }

        // Name Extraction
        let name = 'Unknown';
        const noise = ['government', 'india', 'bharat', 'sarkar', 'authority', 'unique', 'male', 'female', 'dob', 'birth', 'address'];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isLabel = line.toLowerCase().includes('name') || line.includes('नाम');
            if (isLabel && i + 1 < lines.length && !/\d/.test(lines[i + 1])) {
                name = lines[i + 1];
                break;
            }
            if (!noise.some(n => line.toLowerCase().includes(n)) && !/\d/.test(line) && name === 'Unknown') {
                name = line;
            }
        }

        return { name, dob, gender, aadhaarNumber: aadhaar, address, pincode };
    }
}

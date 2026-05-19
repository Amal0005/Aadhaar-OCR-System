import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { AadhaarService } from '../services/aadhaarService.js';
import { AadhaarDataSchema } from '../schemas/AadhaarSchema.js';
import { ErrorMessages } from '../constants/ErrorMessages.js';

export const useAadhaarOCR = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [rawResponse, setRawResponse] = useState<unknown>(null);

  const processImages = async (frontImage: File | null, backImage: File | null) => {
    if (!frontImage || !backImage) {
      toast.error(ErrorMessages.MISSING_BOTH_IMAGES);
      return;
    }

    setLoading(true);
    try {
      const data = await AadhaarService.process(frontImage, backImage);
      const parsedData = AadhaarDataSchema.parse(data.data);

      setResult(parsedData);
      setRawResponse(data);
      toast.success('Processing Complete');
    } catch (err: any) {

      toast.error(err.message || 'Extraction Failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    result,
    rawResponse,
    processImages
  };
};

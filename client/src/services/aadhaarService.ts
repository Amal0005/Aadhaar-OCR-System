import api from './api.js';
import { API_ROUTES } from '../constants/ApiRoutes.js';

export const AadhaarService = {
  process: async (frontImage: File, backImage: File) => {
    const formData = new FormData();
    formData.append('frontImage', frontImage);
    formData.append('backImage', backImage);

    const { data } = await api.post(API_ROUTES.AADHAAR.PROCESS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  },
};


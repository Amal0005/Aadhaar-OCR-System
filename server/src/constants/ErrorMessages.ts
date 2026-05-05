export const ErrorMessages = {
    MISSING_IMAGES: 'Both Front and Back images of the Aadhaar card are required for processing.',
    INVALID_FRONT_IMAGE: 'The "Front Side" image does not appear to be a valid Aadhaar document. Please upload a clear image of your Aadhaar card.',
    FRONT_BACK_MISMATCH_SLOT_FRONT: 'It looks like you uploaded the Back Side in the "Front Side" slot. Please upload the side with your photo and name.',
    FRONT_DATA_NOT_FOUND: 'Could not find Name or Date of Birth on the Front Side. Please upload a clearer image.',
    INVALID_BACK_IMAGE: 'The "Back Side" image does not appear to be a valid Aadhaar document. Please upload the side containing your address.',
    DUPLICATE_IMAGES: 'You have uploaded the same image for both sides. Please upload the Front side and Back side separately.',
    FRONT_BACK_MISMATCH_SLOT_BACK: 'It looks like you uploaded the Front Side of the card in the "Back Side" slot. Please upload the side containing your address.',
    BACK_SIDE_NOT_RECOGNIZED: 'The "Back Side" image does not appear to be the back of an Aadhaar card. Please ensure you uploaded the side containing your address.',
    AADHAAR_NUMBER_MISMATCH: 'The Aadhaar number on the front image does not match the one on the back image. Please upload images of the same Aadhaar card.',
    INTERNAL_SERVER_ERROR: 'Internal Server Error',
} as const;

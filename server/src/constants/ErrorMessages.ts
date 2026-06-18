export const ErrorMessages = {
    MISSING_IMAGES: 'Upload both front and back Aadhaar images.',
    INVALID_FRONT_IMAGE: 'Invalid Aadhaar front image.',
    FRONT_BACK_MISMATCH_SLOT_FRONT: 'Back side uploaded in front slot.',
    FRONT_DATA_NOT_FOUND: 'Name or DOB not found on front side.',
    INVALID_BACK_IMAGE: 'Invalid Aadhaar back image.',
    DUPLICATE_IMAGES: 'Same image uploaded for both sides.',
    FRONT_BACK_MISMATCH_SLOT_BACK: 'Front side uploaded in back slot.',
    BACK_SIDE_NOT_RECOGNIZED: 'Back side not recognized.',
    AADHAAR_NUMBER_MISMATCH: 'Aadhaar numbers do not match.',
    INTERNAL_SERVER_ERROR: 'Internal server error.',
} as const;
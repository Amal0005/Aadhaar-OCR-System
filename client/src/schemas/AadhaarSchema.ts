import { z } from 'zod';

export const AadhaarDataSchema = z.object({
    name: z.string().min(1, "Name is required"),
    dob: z.string().min(1, "Date of Birth is required"),
    gender: z.string().min(1, "Gender is required"),
    aadhaarNumber: z.string().regex(/^\d{4}[\s-]?\d{4}[\s-]?\d{4}$/, "Invalid Aadhaar number format"),
    address: z.string().optional(),
    pincode: z.string().regex(/^\d{6}$/, "Invalid pincode format").optional(),
});

export type AadhaarData = z.infer<typeof AadhaarDataSchema>;

// File validation schema
export const FileSchema = z.instanceof(File).refine(
    (file) => ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type),
    { message: "Please upload JPG or PNG images." }
);

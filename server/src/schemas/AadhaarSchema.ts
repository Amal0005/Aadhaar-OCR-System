import { z } from 'zod';

export const AadhaarDataSchema = z.object({
    name: z.string().default('Unknown'),
    dob: z.string().default('Unknown'),
    gender: z.string().default('Unknown'),
    aadhaarNumber: z.string().default('Unknown'),
    address: z.string().optional().default('Unknown'),
    pincode: z.string().optional().default('Unknown'),
});

export type AadhaarData = z.infer<typeof AadhaarDataSchema>;

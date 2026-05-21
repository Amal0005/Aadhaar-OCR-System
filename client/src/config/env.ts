import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:5000/api'),
});

const parseResult = envSchema.safeParse(import.meta.env);

if (!parseResult.success) {
  console.error('Invalid client environment variables configuration:');
  console.error(JSON.stringify(parseResult.error.format(), null, 2));
  throw new Error('Invalid client environment variables configuration');
}

export const env = parseResult.data;

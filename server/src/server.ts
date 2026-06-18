import { env } from './config/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import aadhaarRoutes from './routes/aadhaarRoutes';

const app = express();
const PORT = env.PORT;

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/aadhaar', aadhaarRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

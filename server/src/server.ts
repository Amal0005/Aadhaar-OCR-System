import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import aadhaarRoutes from './routes/aadhaarRoutes.js';
import { HttpStatus } from './constants/HttpStatus.js';

import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/AppError.js';

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/aadhaar', aadhaarRoutes);

app.get('/health', (req, res) => {
    res.status(HttpStatus.OK).json({ status: 'OK', message: 'Aadhaar OCR Server is running' });
});

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, HttpStatus.NOT_FOUND));
});

app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

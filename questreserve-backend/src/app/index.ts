import path from 'path';
import express from 'express';
import cors from 'cors';
import { jsonBody, requestLogger, errorHandler } from '../middleware';
import apiRouter from '../api';

const app = express();

const isDev = process.env.NODE_ENV !== 'production';
const corsOrigin = process.env.CORS_ORIGIN;
if (!isDev && !corsOrigin) {
  throw new Error('CORS_ORIGIN must be set in production');
}

app.use(cors({
  origin: corsOrigin ?? 'http://localhost:5173',
}));
app.use(requestLogger);
app.use(jsonBody);

app.use('/uploads/location-images', express.static(path.join(process.cwd(), 'uploads', 'location-images')));
app.use('/uploads/profile-pictures', express.static(path.join(process.cwd(), 'uploads', 'profile-pictures')));

app.get('/', (_req, res) => res.send('Ollo, Backend?'));
app.use('/api', apiRouter);

app.use(errorHandler);

export default app;

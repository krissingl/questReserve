import express from 'express';
import { jsonBody, requestLogger, errorHandler } from '../middleware';
import apiRouter from '../api';

const app = express();

app.use(requestLogger);
app.use(jsonBody);

app.get('/', (_req, res) => res.send('Ollo, Backend?'));
app.use('/api', apiRouter);

app.use(errorHandler);

export default app;

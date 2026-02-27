import express from 'express';
import { jsonBody, requestLogger, errorHandler } from '../middleware';

const app = express();

app.use(requestLogger);
app.use(jsonBody);

app.get('/', (_req, res) => res.send('Ollo, Backend?'));

app.use(errorHandler);

export default app;

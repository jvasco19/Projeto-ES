import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ok: true});
});

app.use((req, res) => {
  res.status(404).json({error: 'Rota não encontrada', field: null});
});

app.use(errorHandler);

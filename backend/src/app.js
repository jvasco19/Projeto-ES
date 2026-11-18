import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { requireAuth } from './middleware/requireAuth.js';
import { requireRole } from './middleware/requireRole.js';
import { requestsRouter } from './modules/requests/requests.routes.js';

export const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ok: true});
});

app.use('/api/auth', authRouter);

app.get('/api/products/:productId/my-role',
  requireAuth,
  requireRole('customer', 'product_manager', 'project_manager', 'developer'),
  (req, res) => res.json({role: req.member.role})
);

app.use('/api', requestsRouter);

app.use((req, res) => {
  res.status(404).json({error: 'Rota não encontrada', field: null});
});

app.use(errorHandler);

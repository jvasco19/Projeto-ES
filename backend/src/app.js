import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { requireAuth } from './middleware/requireAuth.js';
import { requireRole } from './middleware/requireRole.js';
import { requestsRouter } from './modules/requests/requests.routes.js';
import { triageRouter } from './modules/triage/triage.routes.js';
import { meRouter } from './modules/me/me.routes.js';
import { productsRouter } from './modules/products/products.routes.js';
import { milestonesRouter } from './modules/milestones/milestones.routes.js';
import { teamsRouter } from './modules/teams/teams.routes.js';
import { membersRouter } from './modules/members/members.routes.js';
import { storiesRouter } from './modules/stories/stories.routes.js';
import { featuresRouter } from './modules/features/features.routes.js';

export const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ok: true});
});

app.use('/api/auth', authRouter);
app.use('/api/me', requireAuth, meRouter);

app.get('/api/products/:productId/my-role',
  requireAuth,
  requireRole('customer', 'product_manager', 'project_manager', 'developer'),
  (req, res) => res.json({role: req.member.role})
);

app.use('/api', requestsRouter);
app.use('/api', teamsRouter);
app.use('/api', productsRouter);
app.use('/api', milestonesRouter);
app.use('/api', triageRouter);
app.use('/api', membersRouter);
app.use('/api', storiesRouter);
app.use('/api', featuresRouter);

app.use((req, res) => {
  res.status(404).json({error: 'Rota não encontrada', field: null});
});

app.use(errorHandler);

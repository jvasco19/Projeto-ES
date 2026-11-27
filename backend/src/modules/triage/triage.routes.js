import { Router } from 'express';
import * as controller from './triage.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireRole } from '../../middleware/requireRole.js';

export const triageRouter = Router();

const pm = [requireAuth, requireRole('product_manager')];

triageRouter.get('/products/:productId/triage', ...pm, controller.list);

triageRouter.post('/products/:productId/triage/:requestId/review', ...pm, controller.review);

triageRouter.patch('/products/:productId/triage/:requestId', ...pm, controller.update);

triageRouter.put('/products/:productId/triage/:requestId/tags', ...pm, controller.setTags);

triageRouter.post('/products/:productId/triage/:requestId/approve', ...pm, controller.approve);

triageRouter.post('/products/:productId/triage/:requestId/reject', ...pm, controller.reject);
import { Router } from 'express';
import * as controller from './requests.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireRole } from '../../middleware/requireRole.js';

export const requestsRouter = Router();

requestsRouter.post('/products/:productId/requests',
    requireAuth,
    requireRole('customer'),
    controller.create
);

requestsRouter.get('/products/:productId/requests/public',
    requireAuth,
    requireRole('customer'),
    controller.listPublic
);
import { Router } from 'express';
import * as controller from './features.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireRole } from '../../middleware/requireRole.js';

const TEAM_ROLES = ['product_manager', 'project_manager', 'developer'];

export const featuresRouter = Router();

featuresRouter.get('/products/:productId/board',
    requireAuth,
    requireRole(...TEAM_ROLES),
    controller.board
);

featuresRouter.get('/products/:productId/features/:featureId',
    requireAuth,
    requireRole(...TEAM_ROLES),
    controller.detail
);

featuresRouter.patch('/products/:productId/features/:featureId/status',
    requireAuth,
    requireRole('developer'),
    controller.changeStatus
);
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

featuresRouter.get('/products/:productId/backlog',
    requireAuth,
    requireRole(...TEAM_ROLES),
    controller.backlog
);

featuresRouter.post('/products/:productId/features',
    requireAuth,
    requireRole('product_manager'),
    controller.create
);

featuresRouter.patch('/products/:productId/features/:featureId/priority',
    requireAuth,
    requireRole('product_manager'),
    controller.changePriority
);

featuresRouter.patch('/products/:productId/features/:featureId/position',
    requireAuth,
    requireRole('product_manager'),
    controller.changePosition
);
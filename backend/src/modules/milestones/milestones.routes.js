import { Router } from 'express';
import * as controller from './milestones.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireRole } from '../../middleware/requireRole.js';

const TEAM_ROLES = ['product_manager', 'project_manager', 'developer'];

export const milestonesRouter = Router();

milestonesRouter.get('/products/:productId/milestones',
    requireAuth,
    requireRole(...TEAM_ROLES),
    controller.list
);

milestonesRouter.post('/products/:productId/milestones',
    requireAuth,
    requireRole('project_manager'),
    controller.create
);

milestonesRouter.patch('/products/:productId/milestones/:milestoneId',
    requireAuth,
    requireRole('project_manager'),
    controller.update
);

milestonesRouter.delete('/products/:productId/milestones/:milestoneId',
    requireAuth,
    requireRole('project_manager'),
    controller.remove
);
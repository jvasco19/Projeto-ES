import { Router } from 'express';
import * as controller from './teams.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireRole } from '../../middleware/requireRole.js';

const TEAM_ROLES = ['product_manager', 'project_manager', 'developer'];

export const teamsRouter = Router();

teamsRouter.get('/products/:productId/teams',
    requireAuth,
    requireRole(...TEAM_ROLES),
    controller.list
);

teamsRouter.post('/products/:productId/teams',
    requireAuth,
    requireRole('project_manager'),
    controller.create
);

teamsRouter.patch('/products/:productId/teams/:teamId',
    requireAuth,
    requireRole('project_manager'),
    controller.update
);

teamsRouter.delete('/products/:productId/teams/:teamId',
    requireAuth,
    requireRole('project_manager'),
    controller.remove
);
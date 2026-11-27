import { Router } from 'express';
import * as controller from './members.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireRole } from '../../middleware/requireRole.js';

const TEAM_ROLES = ['product_manager', 'project_manager', 'developer'];

export const membersRouter = Router();

membersRouter.get('/products/:productId/members',
    requireAuth,
    requireRole(...TEAM_ROLES),
    controller.list
);

membersRouter.post('/products/:productId/members',
    requireAuth,
    requireRole(...TEAM_ROLES),
    controller.invite
);

membersRouter.patch('/products/:productId/members/:userId',
    requireAuth,
    requireRole(...TEAM_ROLES),
    controller.update
);

membersRouter.delete('/products/:productId/members/:userId',
    requireAuth,
    requireRole(...TEAM_ROLES),
    controller.remove
);
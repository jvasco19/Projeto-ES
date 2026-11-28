import { Router } from 'express';
import * as controller from './stories.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireRole } from '../../middleware/requireRole.js';

export const storiesRouter = Router();

const team = [requireAuth, requireRole('product_manager', 'project_manager', 'developer')];
const pm = [requireAuth, requireRole('product_manager')];
const path = '/products/:productId/features/:featureId/story';

storiesRouter.get(path, ...team, controller.get);

storiesRouter.post(path, ...pm, controller.create);

storiesRouter.patch(path, ...pm, controller.update);

storiesRouter.post(`${path}/criteria`, ...pm, controller.addCriterion);

storiesRouter.patch(`${path}/criteria/:criterionId`, ...pm, controller.updateCriterion);

storiesRouter.delete(`${path}/criteria/:criterionId`, ...pm, controller.removeCriterion);
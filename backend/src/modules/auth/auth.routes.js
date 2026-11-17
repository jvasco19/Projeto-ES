import { Router } from 'express';
import * as controller from './auth.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export const authRouter = Router();

authRouter.post('/register/', controller.register);
authRouter.post('/login/', controller.login);
authRouter.get('/me/', requireAuth, controller.me);
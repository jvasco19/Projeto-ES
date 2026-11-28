import { Router } from 'express';
import * as controller from './products.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export const productsRouter = Router();

productsRouter.post('/products', requireAuth, controller.create);
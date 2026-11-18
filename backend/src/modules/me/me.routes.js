import { Router } from 'express';
import { listRequests, getRequest, notifications } from './me.controller.js';

export const meRouter = Router();

meRouter.get('/requests', listRequests);
meRouter.get('/requests/:id', getRequest);
meRouter.get('/notifications', notifications);
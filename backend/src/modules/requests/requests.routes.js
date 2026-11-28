import { Router } from 'express';
import * as controller from './requests.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { requireRequestAuthor } from '../../middleware/requireRequestAuthor.js';
import { uploadAttachment } from '../../middleware/uploadAttachment.js';

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

requestsRouter.post('/products/:productId/requests/:requestId/vote',
    requireAuth,
    requireRole('customer'),
    controller.vote
);

requestsRouter.delete('/products/:productId/requests/:requestId/vote',
    requireAuth,
    requireRole('customer'),
    controller.unvote
);

requestsRouter.post('/requests/:requestId/attachments',
    requireAuth,
    requireRequestAuthor,
    uploadAttachment,
    controller.addAttachment
);

requestsRouter.get('/attachments/:attachmentId',
    requireAuth,
    controller.getAttachment
)
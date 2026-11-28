import { HttpError } from '../../utils/HttpError.js';
import {
    findRequestsByAuthor,
    findRequestById,
    findAttachmentsByRequest,
    findStatusChangesByRequest,
    findNotificationsForUser,
} from './me.repository.js';

const NORMAL_PATH = ['submitted', 'in_review', 'approved', 'planned', 'delivered'];
const REJECTED_PATH = ['submitted', 'in_review', 'rejected'];

export async function listMyRequests(userID) {
    return findRequestsByAuthor(userID);
}

export async function getMyRequest(userID, rawID) {
    const requestId = Number(rawID);
    if (!Number.isSafeInteger(requestId) || requestId <= 0){
        throw new HttpError(400, 'O id do pedido tem de ser um número inteiro', 'id');
    }
    const request = await findRequestById(requestId);
    if (!request){
        throw new HttpError(404, 'Pedido não encontrado');
    }
    if (Number(request.authorId) !== userID){
        throw new HttpError(403, 'Este pedido não pertence à tua conta');
    }

    const attachments = await findAttachmentsByRequest(requestId);
    const changes = await findStatusChangesByRequest(requestId);

    return{
        id: request.id,
        title: request.title,
        description: request.description,
        status: request.status,
        category: request.category,
        rejectionReason: request.rejectionReason,
        productId: request.productId,
        productName: request.productName,
        createdAt: request.createdAt,
        release: request.release,
        attachments,
        timeline: buildTimeline(request.status, changes),
    };
}

function buildTimeline(currentStatus, changes) {
    const path = currentStatus === 'rejected' ? REJECTED_PATH : NORMAL_PATH;

    return path.map((status) => {
        const change = changes.findLast((c) => c.status === status);
        return { status, date:change ? change.changedAt : null};
    });
}

export async function listMyNotifications(userID) {
    const rows = await findNotificationsForUser(userID);

    return rows.map((row) => ({
        id: row.id,
        type: 'status',
        reason: row.isAuthor ? 'author' : 'vote',
        requestId: row.requestId,
        requestTitle: row.requestTitle,
        status: row.status,
        createdAt: row.createdAt,
        link: row.isAuthor ? `/me/requests/${row.requestId}` : `/me/products/${row.productId}`,
    }));
}
import { HttpError } from '../utils/HttpError.js';
import { findRequestAuthor } from '../modules/requests/requests.repository.js';

export async function requireRequestAuthor(req, res, next) {
    const requestId = Number(req.params.requestId);
    if (!Number.isSafeInteger(requestId) || requestId <= 0)
        return next(new HttpError(400, 'O id do pedido tem de ser um numero inteiro', 'requestId'));

    const authorId = await findRequestAuthor(requestId);
    if(authorId === null)
        return next(new HttpError(404, 'Pedido não encontrado'));
    if(Number(authorId) !== req.user.id)
        return next(new HttpError(403, 'Este pedidio não pertence à tua conta'));

    req.requestId = requestId;
    next();
}
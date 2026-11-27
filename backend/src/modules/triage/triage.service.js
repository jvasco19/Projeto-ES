import { HttpError } from '../../utils/HttpError.js';
import * as repo from './triage.repository.js';

// os valores do enum request_category.
const CATEGORIES = ['reports', 'integrations', 'notifications', 'usability', 'performance', 'security'];
const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

function parseRequestId(value) {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new HttpError(400, 'O id do pedido tem de ser um numero inteiro', 'requestId');
    }
    return id;
}

// o pedido tem de existir e pertencer ao produto do URL.
async function findRequestOr404(productId, rawRequestId) {
    const request = await repo.findRequest(productId, parseRequestId(rawRequestId));
    if (!request) throw new HttpError(404, 'Pedido não encontrado');
    return request;
}

// junta a cada pedido os anexos, as etiquetas e as versões.
async function withDetails(requests) {
    const ids = requests.map((r) => r.id);
    if (ids.length === 0) return [];

    const [attachments, tags, versions] = await Promise.all([
        repo.findAttachments(ids),
        repo.findTags(ids),
        repo.findVersions(ids),
    ]);

    return requests.map((r) => {
        const ofRequest = (list) => list.filter((item) => item.requestId === r.id);
        return {
            ...r,
            attachments: ofRequest(attachments),
            tags: ofRequest(tags).map((t) => t.name),
            // a versao mais recente é a descrição atual, as anteriores aparecem no historico
            versions: ofRequest(versions).slice(1),
        };
    });
}

async function getOne(productId, requestId) {
    const [request] = await withDetails(await repo.findRequests(productId, requestId));
    return request;
}

export async function list(productId) {
    return withDetails(await repo.findRequests(productId));
}

// abrir um pedido submetido passa-o a "Em analise"
export async function review(productId, rawRequestId, userId) {
    const request = await findRequestOr404(productId, rawRequestId);
    if (request.status === 'submitted') {
        await repo.changeStatus(request.id, 'submitted', 'in_review', userId);
    }
    return getOne(productId, request.id);
}

// categorias, etiquetas e edição da descrição
export async function update(productId, rawRequestId, userId, data = {}) {
    const request = await findRequestOr404(productId, rawRequestId);
    const changes = {};

    if (data.description !== undefined) {
        const description = typeof data.description === 'string' ? data.description.trim() : '';
        if (!description) throw new HttpError(400, 'A descrição não pode ficar vazia', 'description');
        if (description !== request.description) changes.description = description;
    }
    if (data.category !== undefined) {
        if (data.category !== null && !CATEGORIES.includes(data.category)) {
            throw new HttpError(400, 'Escolhe uma categoria válida', 'category');
        }
        changes.category = data.category;
    }
    if (data.isPublic !== undefined) {
        if (typeof data.isPublic !== 'boolean') throw new HttpError(400, 'A visibilidade tem de ser verdadeira ou falsa', 'isPublic');
        changes.isPublic = data.isPublic;
    }

    if (Object.keys(changes).length > 0) {
        await repo.updateRequest(request, changes, userId);
    }
    return getOne(productId, request.id);
}

// substitui as etiquetas do pedido pelas que vierem na lista
export async function setTags(productId, rawRequestId, data = {}) {
    const request = await findRequestOr404(productId, rawRequestId);
    if (!Array.isArray(data.tags)) throw new HttpError(400, 'As etiquetas têm de vir numa lista', 'tags');

    const tags = [...new Set(data.tags.map((t) => (typeof t === 'string' ? t.trim() : '')).filter(Boolean))];
    if (tags.length > MAX_TAGS) throw new HttpError(400, `No máximo ${MAX_TAGS} etiquetas por pedido`, 'tags');
    if (tags.some((t) => t.length > MAX_TAG_LENGTH)) {
        throw new HttpError(400, `Cada etiqueta pode ter no máximo ${MAX_TAG_LENGTH} caracteres`, 'tags');
    }

    await repo.setTags(productId, request.id, tags);
    return getOne(productId, request.id);
}

// so um pedido em analise pode ser aprovado
export async function approve(productId, rawRequestId, userId) {
    const request = await findRequestOr404(productId, rawRequestId);
    if (request.status !== 'in_review') {
        throw new HttpError(409, 'Só é possível aprovar um pedido que está em análise');
    }
    await repo.changeStatus(request.id, 'in_review', 'approved', userId);
    return getOne(productId, request.id);
}

// rejeitar pedido com motivo
export async function reject(productId, rawRequestId, userId, data = {}) {
    const request = await findRequestOr404(productId, rawRequestId);
    const reason = typeof data.reason === 'string' ? data.reason.trim() : '';
    if (!reason) throw new HttpError(400, 'Indica o motivo da rejeição. O cliente vai vê-lo no pedido.', 'reason');
    if (request.status !== 'in_review') {
        throw new HttpError(409, 'Só é possível rejeitar um pedido que está em análise');
    }
    await repo.changeStatus(request.id, 'in_review', 'rejected', userId, reason);
    return getOne(productId, request.id);
}

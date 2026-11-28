import { HttpError } from '../../utils/HttpError.js';
import * as repo from './requests.repository.js';
import fs from 'node:fs/promises'
import path from 'node:path';
import { UPLOAD_DIR } from '../../middleware/uploadAttachment.js';

const CATEGORIES = ['reports', 'integrations', 'notifications', 'usability', 'performance', 'security'];

function optionalText(value){
    const text = typeof value === 'string' ? value.trim() : '';
    return text || null;
}

export async function create(productId, authorId, data = {}) {
    const title = data.title?.trim();
    const description = data.description?.trim();
    const category = data.category;

    if (!title) throw new HttpError(400, 'Indica um título', 'title');
    if (!description) throw new HttpError(400, 'Descreve o que precisas', 'description');
    if (!CATEGORIES.includes(category)) throw new HttpError(400, 'Escolhe uma categoria', 'category');

    const importance = data.importance ?? null;
    if (importance !== null && !(Number.isInteger(importance) && importance >= 1 && importance <= 5)) {
        throw new HttpError(400, 'A importancia tem de ser um número de 1 a 5', 'importance');
    }

    return repo.create({
        productId,
        authorId,
        title,
        description,
        category,
        currentWorkflow: optionalText(data.currentWorkflow),
        impact: optionalText(data.impact),
        importance,
    });
}

export async function listPublic(productId, search) {
    const text = typeof search === 'string' ? search.trim() : '';
    return repo.findPublic(productId, text || null);
}

// Corrige o nome original do ficheiro
// - o multer pode entregar o nome em latin1 (acentos trocados) ou já correto
// - o macOS separa os acentos das letras (NFD), por isso juntam-se com normalize('NFC')
// - caracteres de controlo (como 0x00) são retirados porque o PostgreSQL não os aceita
function decodeFileName(name) {
    const fixed = /[^\u0000-\u00ff]/.test(name) ? name : Buffer.from(name, 'latin1').toString('utf8');
    const result = fixed.includes('\uFFFD') ? name : fixed;
    return result.replace(/[\u0000-\u001f\u007f]/g, '').normalize('NFC').slice(0, 255) || 'ficheiro';
}

export async function addAttachment(userId, requestId, file) {
    if (!file) throw new HttpError(400, 'Escolhe um ficheiro', 'file');

    try {
        return await repo.insertAttachment({
            requestId,
            fileName: decodeFileName(file.originalname),
            mimeType: file.mimetype,
            sizeBytes: file.size,
            storagePath: file.filename,
            uploadedBy: userId,
        });
    } catch (err) {
        await fs.unlink(file.path).catch(() => {});
        throw err;
    }
    
}

// o pedido tem de existir ser público e pertencer ao produto do URL
async function findPublicRequestOr404(productId, rawRequestId) {
    const requestId = Number(rawRequestId);
    if (!Number.isSafeInteger(requestId) || requestId <= 0) {
        throw new HttpError(400, 'O id do pedido tem de ser um número inteiro', 'requestId');
    }

    const request = await repo.findPublicRequest(productId, requestId);
    if (!request) throw new HttpError(404, 'Pedido não encontrado');
    return request;
}

// votar duas vezes no mesmo pedido não dá erro o voto continua a ser só um
export async function vote(productId, rawRequestId, userId) {
    const request = await findPublicRequestOr404(productId, rawRequestId);
    if (Number(request.authorId) === userId) {
        throw new HttpError(409, 'Não podes votar no teu próprio pedido');
    }

    await repo.insertVote(request.id, userId);
    const votes = await repo.countVotes(request.id);
    return { requestId: request.id, votes, votedByMe: true };
}

// retirar um voto que não existe não dá erro
export async function unvote(productId, rawRequestId, userId) {
    const request = await findPublicRequestOr404(productId, rawRequestId);
    await repo.deleteVote(request.id, userId);
    const votes = await repo.countVotes(request.id);
    return { requestId: request.id, votes, votedByMe: false };
}

// Ver um anexo o autor do pedido ou a equipa do produto
export async function getAttachment(userId, rawAttachmentId) {
    const attachmentId = Number(rawAttachmentId);
    if (!Number.isSafeInteger(attachmentId) || attachmentId <= 0) {
        throw new HttpError(400, 'O id do anexo tem de ser um número inteiro', 'attachmentId');
    }

    const attachment = await repo.findAttachmentById(attachmentId);
    if (!attachment) throw new HttpError(404, 'Anexo não encontrado');

    const isAuthor = Number(attachment.authorId) === userId;
    if (!isAuthor) {
        const role = await repo.findMemberRole(attachment.productId, userId);
        if (!role || role === 'customer') throw new HttpError(403, 'Não tens acesso a este anexo');
    }

    // basename impede caminhos como ../ o ficheiro tem de estar dentro de uploads/
    const filePath = path.join(UPLOAD_DIR, path.basename(attachment.storagePath ?? ''));
    try {
        await fs.access(filePath);
    } catch {
        throw new HttpError(404, 'O ficheiro deste anexo já não está disponível');
    }

    return { filePath, fileName: attachment.fileName, mimeType: attachment.mimeType };
}
import { HttpError } from '../../utils/HttpError.js';
import * as repo from './requests.repository.js';
import fs from 'node:fs/promises'

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
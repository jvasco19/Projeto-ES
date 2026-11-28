import crypto from 'node:crypto';
import { HttpError } from '../../utils/HttpError.js';
import * as repo from './products.repository.js';

// link que a equipa partilha com os clientes
function newLinkToken(name) {
    const letters = [...name.normalize('NFD').toLowerCase()].filter((c) => c >= 'a' && c <= 'z');
    const prefix = letters.slice(0, 3).join('') || 'prd';
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${code}`;
}

// quem cria o produto fica como Project Manager
export async function create(userId, data = {}) {
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    if (!name) throw new HttpError(400, 'Dá um nome ao produto', 'name');
    if (name.length > 80) throw new HttpError(400, 'O nome tem no máximo 80 caracteres', 'name');
    const description = typeof data.description === 'string' && data.description.trim() ? data.description.trim() : null;

    return repo.createWithOwner({ name, description, linkToken: newLinkToken(name) }, userId);
}